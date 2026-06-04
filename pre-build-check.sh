#!/usr/bin/env bash
# ============================================================
# pre-build-check.sh
# Run this before every EAS build to catch known issues early.
# Usage: ./pre-build-check.sh [android|ios|both]
# ============================================================

set -euo pipefail

PLATFORM="${1:-both}"
PASS=0
FAIL=0
WARN=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ok()   { echo -e "  ${GREEN}✔${NC} $1"; ((PASS++))  || true; }
fail() { echo -e "  ${RED}✗${NC} $1"; ((FAIL++))  || true; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; ((WARN++)) || true; }

section() { echo -e "\n${YELLOW}▶ $1${NC}"; }

# ----------------------------------------------------------------
# 0. Must be run from project root
# ----------------------------------------------------------------
if [[ ! -f "eas.json" ]]; then
  echo -e "${RED}ERROR: Run this script from the project root (where eas.json lives).${NC}"
  exit 1
fi

PROJECT_ROOT="$(pwd)"

# ----------------------------------------------------------------
# 1. Git hygiene
# ----------------------------------------------------------------
section "Git hygiene"

# Uncommitted changes
if git diff --quiet && git diff --cached --quiet; then
  ok "No uncommitted changes"
else
  warn "You have uncommitted changes. EAS requireCommit will reject the build unless you commit or use EAS_BUILD_AUTOCOMMIT=1"
  git status --short
fi

# Branch check
BRANCH=$(git rev-parse --abbrev-ref HEAD)
ok "On branch: $BRANCH"

# ----------------------------------------------------------------
# 2. Android native folder in git
# ----------------------------------------------------------------
section "Android native folder"

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
  if git ls-files --error-unmatch android/gradlew &>/dev/null 2>&1; then
    ok "android/gradlew is tracked by git"
  else
    fail "android/gradlew is NOT tracked by git — EAS will fail with 'gradlew not found'. Run: git add android/ && git commit"
  fi

  # android/ not in .gitignore
  if git check-ignore -q android/ 2>/dev/null; then
    fail "android/ is gitignored — remove it from .gitignore (bare workflow needs it committed)"
  else
    ok "android/ is not gitignored"
  fi
fi

# ----------------------------------------------------------------
# 3. iOS native folder in git (if applicable)
# ----------------------------------------------------------------
section "iOS native folder"

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
  if git ls-files --error-unmatch ios/Podfile &>/dev/null 2>&1; then
    ok "ios/Podfile is tracked by git"
  else
    fail "ios/Podfile is NOT tracked by git — EAS will fail. Run: git add ios/ && git commit"
  fi

  if git check-ignore -q ios/ 2>/dev/null; then
    fail "ios/ is gitignored — remove it from .gitignore (bare workflow needs it committed)"
  else
    ok "ios/ is not gitignored"
  fi
fi

# ----------------------------------------------------------------
# 4. PNG / image assets not accidentally gitignored
# ----------------------------------------------------------------
section "Image assets in git"

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
  MISSING_PNGS=()
  while IFS= read -r -d '' f; do
    if git check-ignore -q "$f" 2>/dev/null; then
      MISSING_PNGS+=("$f")
    fi
  done < <(find android/app/src/main/res -name "*.png" -o -name "*.webp" 2>/dev/null | tr '\n' '\0')

  if [[ ${#MISSING_PNGS[@]} -gt 0 ]]; then
    fail "The following android drawable files are gitignored and will cause 'resource not found' errors:"
    for f in "${MISSING_PNGS[@]}"; do echo "    $f"; done
    echo "    Fix: add '!android/**/*.png' and '!android/**/*.webp' exceptions to .gitignore"
  else
    ok "All android drawable PNG/WebP files are tracked by git"
  fi

  # Check the .gitignore for the dangerous wildcard without exception
  if grep -q '^\*\.png' .gitignore 2>/dev/null; then
    if ! grep -q '!android/\*\*/\*\.png' .gitignore 2>/dev/null; then
      fail ".gitignore has '*.png' but is missing '!android/**/*.png' exception"
    else
      ok ".gitignore '*.png' rule has '!android/**/*.png' exception"
    fi
    if ! grep -q '!android/\*\*/\*\.webp' .gitignore 2>/dev/null; then
      warn ".gitignore may be missing '!android/**/*.webp' exception"
    else
      ok ".gitignore has '!android/**/*.webp' exception"
    fi
  fi
fi

# ----------------------------------------------------------------
# 5. Babel config — hermes-v0 transform profile
# ----------------------------------------------------------------
section "Babel config (hermesc compatibility)"

if [[ -f "babel.config.js" ]]; then
  if grep -q "hermes-v0" babel.config.js; then
    ok "babel.config.js has 'hermes-v0' unstable_transformProfile"
  else
    fail "babel.config.js is missing unstable_transformProfile: 'hermes-v0'. hermesc 0.12.0+ will fail on ES2022 private class fields (#field syntax)"
    echo "    Fix: set presets: [['babel-preset-expo', { unstable_transformProfile: 'hermes-v0' }]]"
  fi
else
  warn "babel.config.js not found — skipping hermes check"
fi

# ----------------------------------------------------------------
# 6. EAS secrets — SENTRY_AUTH_TOKEN
# ----------------------------------------------------------------
section "EAS secrets"

if command -v eas &>/dev/null; then
  SECRET_OUTPUT=$(eas secret:list 2>/dev/null || echo "")
  if echo "$SECRET_OUTPUT" | grep -q "SENTRY_AUTH_TOKEN"; then
    ok "SENTRY_AUTH_TOKEN is stored as an EAS secret"
  else
    fail "SENTRY_AUTH_TOKEN is NOT in EAS secrets — Sentry source map upload will fail during build"
    echo "    Fix: eas secret:create --scope project --name SENTRY_AUTH_TOKEN --type string --value <token>"
  fi
else
  warn "eas CLI not found — skipping EAS secrets check"
fi

# Never hardcoded in files
if grep -r "SENTRY_AUTH_TOKEN\s*=\s*['\"]sntryu_" . \
     --include="*.js" --include="*.ts" --include="*.json" \
     --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build \
     -l 2>/dev/null | grep -q .; then
  fail "SENTRY_AUTH_TOKEN appears to be hardcoded in a source file — remove it immediately!"
else
  ok "SENTRY_AUTH_TOKEN is not hardcoded in any source file"
fi

# ----------------------------------------------------------------
# 7. eas.json — production profile sanity
# ----------------------------------------------------------------
section "eas.json production profile"

if [[ -f "eas.json" ]]; then
  # Node version pinned
  if node -e "const e=require('./eas.json'); process.exit(e.build?.production?.node ? 0 : 1)" 2>/dev/null; then
    NODE_VER=$(node -e "const e=require('./eas.json'); console.log(e.build?.production?.node)")
    ok "Node version pinned to $NODE_VER in eas.json"
  else
    warn "No node version pinned in eas.json production profile — builds may use unexpected Node version"
  fi

  # credentialsSource set
  CRED_SRC=$(node -e "const e=require('./eas.json'); console.log(e.build?.production?.android?.credentialsSource ?? e.build?.production?.credentialsSource ?? 'not set')" 2>/dev/null || echo "not set")
  ok "credentialsSource: $CRED_SRC"
else
  fail "eas.json not found"
fi

# ----------------------------------------------------------------
# 8. app.json — version sanity
# ----------------------------------------------------------------
section "app.json version"

if [[ -f "app.json" ]]; then
  VERSION=$(node -e "const a=require('./app.json'); console.log(a.expo?.version)" 2>/dev/null)
  VERSION_CODE=$(node -e "const a=require('./app.json'); console.log(a.expo?.android?.versionCode)" 2>/dev/null)
  BUILD_NUMBER=$(node -e "const a=require('./app.json'); console.log(a.expo?.ios?.buildNumber)" 2>/dev/null)
  ok "App version: $VERSION"
  [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]] && ok "Android versionCode: $VERSION_CODE"
  [[ "$PLATFORM" == "ios"     || "$PLATFORM" == "both" ]] && ok "iOS buildNumber: $BUILD_NUMBER"
else
  fail "app.json not found"
fi

# ----------------------------------------------------------------
# 9. sentry.properties — no hardcoded auth token
# ----------------------------------------------------------------
section "Sentry config"

if [[ -f "android/sentry.properties" ]]; then
  if grep -q "auth.token" android/sentry.properties; then
    fail "android/sentry.properties contains 'auth.token' — this hardcodes the token. Remove it and rely on the SENTRY_AUTH_TOKEN env var instead."
  else
    ok "android/sentry.properties does not hardcode auth.token"
  fi
fi

if [[ -f "ios/sentry.properties" ]]; then
  if grep -q "auth.token" ios/sentry.properties; then
    fail "ios/sentry.properties contains 'auth.token' — hardcoded token detected. Remove it."
  else
    ok "ios/sentry.properties does not hardcode auth.token"
  fi
fi

# ----------------------------------------------------------------
# Summary
# ----------------------------------------------------------------
echo ""
echo "========================================"
echo -e "  Results: ${GREEN}${PASS} passed${NC}  |  ${YELLOW}${WARN} warnings${NC}  |  ${RED}${FAIL} failed${NC}"
echo "========================================"

if [[ $FAIL -gt 0 ]]; then
  echo -e "${RED}Fix the failures above before pushing a build.${NC}"
  exit 1
elif [[ $WARN -gt 0 ]]; then
  echo -e "${YELLOW}Build can proceed but review warnings above.${NC}"
  exit 0
else
  echo -e "${GREEN}All checks passed. Safe to build!${NC}"
  exit 0
fi
