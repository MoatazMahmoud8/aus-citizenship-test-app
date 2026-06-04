#!/usr/bin/env bash
# ============================================================
# build.sh — safe EAS build wrapper
# Runs pre-build-check.sh first; only proceeds if all checks pass.
# Usage: ./build.sh [android|ios|both]
# ============================================================

set -euo pipefail

PLATFORM="${1:-both}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo " Pre-build verification for: $PLATFORM"
echo "=========================================="

# Run pre-build checks — exits non-zero if any FAIL
"$SCRIPT_DIR/pre-build-check.sh" "$PLATFORM"

echo ""
echo "=========================================="
echo " Starting EAS build for: $PLATFORM"
echo "=========================================="

case "$PLATFORM" in
  android)
    EAS_BUILD_AUTOCOMMIT=1 eas build --platform android --profile production --non-interactive
    ;;
  ios)
    EAS_BUILD_AUTOCOMMIT=1 eas build --platform ios --profile production --non-interactive
    ;;
  both)
    EAS_BUILD_AUTOCOMMIT=1 eas build --platform all --profile production --non-interactive
    ;;
  *)
    echo "Unknown platform: $PLATFORM. Use android, ios, or both."
    exit 1
    ;;
esac
