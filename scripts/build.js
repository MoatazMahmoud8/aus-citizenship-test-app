#!/usr/bin/env node
/**
 * Centralized Build Script for ACE - AU Citizenship Exam
 * 
 * Single source of truth for building, monitoring, and verifying EAS builds.
 * 
 * Usage:
 *   node scripts/build.js                    # Full build: validate → build → monitor → verify
 *   node scripts/build.js --check            # Pre-build validation only
 *   node scripts/build.js --status <id>      # Check build status
 *   node scripts/build.js --logs <id>        # Fetch full server logs
 *   node scripts/build.js --monitor <id>     # Poll build until completion
 *   node scripts/build.js --platform ios     # Build for iOS instead of Android
 *   node scripts/build.js --profile preview  # Use a different build profile
 *   node scripts/build.js --creds             # View all EAS credentials & keystores
 * 
 * See BUILD-TROUBLESHOOTING.md for known issues and solutions.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════

const PROJECT_DIR = path.resolve(__dirname, '..');
const EXPECTED_PACKAGE = 'xyz.jsmglobal.ace';
const EAS_PROJECT_ID = '9fdaa0fe-9fc3-402d-88fa-85c17d00445d';
const POLL_INTERVAL_MS = 30000; // 30 seconds
const MAX_POLL_MINUTES = 30;

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const colors = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

function log(msg, type = 'info') {
  const prefix = {
    info: colors.blue('ℹ'),
    ok: colors.green('✔'),
    warn: colors.yellow('⚠'),
    error: colors.red('✖'),
    step: colors.bold('→'),
  }[type] || '•';
  console.log(`${prefix} ${msg}`);
}

function banner(text) {
  const line = '═'.repeat(60);
  console.log(`\n${colors.blue(line)}`);
  console.log(colors.bold(`  ${text}`));
  console.log(`${colors.blue(line)}\n`);
}

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, {
      cwd: PROJECT_DIR,
      encoding: 'utf8',
      stdio: opts.silent ? 'pipe' : 'inherit',
      ...opts,
    });
  } catch (e) {
    if (opts.silent) return e.stdout || '';
    throw e;
  }
}

function runCapture(cmd) {
  return run(cmd, { silent: true, stdio: 'pipe' }).trim();
}

function getExpoToken() {
  const stateFile = path.join(
    process.env.USERPROFILE || process.env.HOME,
    '.expo',
    'state.json'
  );
  if (!fs.existsSync(stateFile)) {
    throw new Error('Not logged in to Expo. Run: eas login');
  }
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  return state.auth?.sessionSecret;
}

function graphql(query) {
  return new Promise((resolve, reject) => {
    const token = getExpoToken();
    const body = JSON.stringify({ query });
    const opts = {
      hostname: 'api.expo.dev',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'expo-session': token,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.errors) {
            reject(new Error(result.errors[0].message));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve(body));
      res.on('error', reject);
    });
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ═══════════════════════════════════════════════════════════════
// Pre-Build Checks
// ═══════════════════════════════════════════════════════════════

async function runChecks() {
  banner('Pre-Build Validation');
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  function check(name, fn) {
    try {
      const result = fn();
      if (result === 'warn') {
        log(`${name}`, 'warn');
        warnings++;
      } else {
        log(`${name}`, 'ok');
        passed++;
      }
    } catch (e) {
      log(`${name}: ${e.message}`, 'error');
      failed++;
    }
  }

  // Check 1: Git root is project directory
  check('Git root is project directory', () => {
    const gitRoot = runCapture('git rev-parse --show-toplevel').replace(/\//g, '\\');
    const projNorm = PROJECT_DIR.replace(/\//g, '\\');
    if (gitRoot.toLowerCase() !== projNorm.toLowerCase()) {
      throw new Error(
        `Git root is "${gitRoot}" but project is "${projNorm}". ` +
        `Run "git init" inside the project directory.`
      );
    }
  });

  // Check 2: Working tree is clean
  check('Git working tree is clean', () => {
    const status = runCapture('git status --porcelain');
    if (status.length > 0) {
      const lines = status.split('\n').filter(Boolean);
      throw new Error(
        `${lines.length} uncommitted change(s). ` +
        `Commit or stash before building (requireCommit is enabled).\n` +
        lines.slice(0, 5).map(l => `  ${l}`).join('\n') +
        (lines.length > 5 ? `\n  ... and ${lines.length - 5} more` : '')
      );
    }
  });

  // Check 3: package-lock.json exists
  check('package-lock.json exists', () => {
    if (!fs.existsSync(path.join(PROJECT_DIR, 'package-lock.json'))) {
      throw new Error('Missing package-lock.json. Run "npm install" to generate it.');
    }
  });

  // Check 4: No local android/ or ios/ in git
  check('No local native build artifacts in git', () => {
    const androidInGit = runCapture('git ls-files android/').length > 0;
    const iosInGit = runCapture('git ls-files ios/').length > 0;
    if (androidInGit || iosInGit) {
      throw new Error(
        'android/ or ios/ folders are tracked by git. ' +
        'Add them to .gitignore and run: git rm -r --cached android/ ios/'
      );
    }
    // Warn if they exist locally
    if (fs.existsSync(path.join(PROJECT_DIR, 'android'))) {
      return 'warn';
    }
  });

  // Check 5: eas.json has requireCommit
  check('eas.json has requireCommit: true', () => {
    const eas = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'eas.json'), 'utf8'));
    if (!eas.cli?.requireCommit) {
      throw new Error(
        'Missing "requireCommit": true in eas.json cli config. ' +
        'This is required to fix the tar extraction bug with parentheses paths. ' +
        'See BUILD-TROUBLESHOOTING.md Issue 1.'
      );
    }
  });

  // Check 6: app.json package name
  check(`app.json package is "${EXPECTED_PACKAGE}"`, () => {
    const appJson = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'app.json'), 'utf8'));
    const androidPkg = appJson.expo?.android?.package;
    const iosPkg = appJson.expo?.ios?.bundleIdentifier;
    if (androidPkg !== EXPECTED_PACKAGE) {
      throw new Error(`Android package is "${androidPkg}", expected "${EXPECTED_PACKAGE}"`);
    }
    if (iosPkg !== EXPECTED_PACKAGE) {
      throw new Error(`iOS bundleIdentifier is "${iosPkg}", expected "${EXPECTED_PACKAGE}"`);
    }
  });

  // Check 7: .easignore exists and has critical entries
  check('.easignore excludes native artifacts', () => {
    const easignorePath = path.join(PROJECT_DIR, '.easignore');
    if (!fs.existsSync(easignorePath)) {
      throw new Error('Missing .easignore file');
    }
    const content = fs.readFileSync(easignorePath, 'utf8');
    const required = ['android/', 'ios/'];
    const missing = required.filter((r) => !content.includes(r));
    if (missing.length > 0) {
      throw new Error(`.easignore missing entries: ${missing.join(', ')}`);
    }
  });

  // Check 8: Expo login
  check('Logged in to Expo', () => {
    try {
      const whoami = runCapture('npx eas whoami 2>&1');
      if (whoami.includes('not logged in') || whoami.includes('error')) {
        throw new Error('');
      }
    } catch {
      throw new Error('Not logged in. Run: eas login');
    }
  });

  // Check 9: Validate key dependencies exist
  check('Key dependencies are valid', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'package.json'), 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const suspicious = [];
    for (const [name, version] of Object.entries(deps)) {
      // Check if node_modules has this package
      const modPath = path.join(PROJECT_DIR, 'node_modules', name, 'package.json');
      if (!fs.existsSync(modPath)) {
        suspicious.push(`${name}@${version}`);
      }
    }
    if (suspicious.length > 0) {
      throw new Error(
        `Missing from node_modules: ${suspicious.join(', ')}. Run "npm install".`
      );
    }
  });

  // Summary
  console.log('');
  log(`Checks complete: ${colors.green(passed + ' passed')}, ${colors.red(failed + ' failed')}, ${colors.yellow(warnings + ' warnings')}`, 'step');

  if (failed > 0) {
    console.log('');
    log('Fix the errors above before building. See BUILD-TROUBLESHOOTING.md', 'error');
    return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Build
// ═══════════════════════════════════════════════════════════════

async function startBuild(platform, profile) {
  banner(`Starting EAS Build (${platform} / ${profile})`);
  
  const output = runCapture(
    `npx eas build --platform ${platform} --profile ${profile} --no-wait --json 2>&1`
  );

  // Try to parse JSON output for build ID
  try {
    const builds = JSON.parse(output);
    if (Array.isArray(builds) && builds.length > 0) {
      const build = builds[0];
      log(`Build submitted successfully!`, 'ok');
      log(`Build ID: ${colors.bold(build.id)}`, 'info');
      log(`Platform: ${build.platform}`, 'info');
      log(`Status: ${build.status}`, 'info');
      if (build.appVersion) log(`Version: ${build.appVersion} (${build.appBuildVersion})`, 'info');
      return build.id;
    }
  } catch {
    // JSON parse failed, try to extract build ID from text output
    const match = output.match(/Build details:.*\/builds\/([a-f0-9-]+)/);
    if (match) {
      log(`Build submitted! ID: ${colors.bold(match[1])}`, 'ok');
      return match[1];
    }
    
    // Also check for the build ID pattern in the output
    const idMatch = output.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/);
    if (idMatch) {
      log(`Build submitted! ID: ${colors.bold(idMatch[1])}`, 'ok');
      return idMatch[1];
    }
  }

  // If we get here, show the raw output
  console.log(output);
  log('Could not parse build ID from output. Check EAS dashboard.', 'warn');
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Monitor
// ═══════════════════════════════════════════════════════════════

async function getBuildStatus(buildId) {
  const data = await graphql(`{
    builds {
      byId(buildId: "${buildId}") {
        id
        status
        error { errorCode message }
        artifacts { buildUrl }
        logFiles
      }
    }
  }`);
  return data.builds.byId;
}

async function monitorBuild(buildId) {
  banner(`Monitoring Build: ${buildId}`);
  
  const maxPolls = (MAX_POLL_MINUTES * 60000) / POLL_INTERVAL_MS;
  let polls = 0;
  
  while (polls < maxPolls) {
    polls++;
    try {
      const build = await getBuildStatus(buildId);
      const elapsed = Math.round((polls * POLL_INTERVAL_MS) / 60000);
      
      switch (build.status) {
        case 'FINISHED':
          log(`Build SUCCEEDED! (after ~${elapsed} min)`, 'ok');
          if (build.artifacts?.buildUrl) {
            log(`Download: ${build.artifacts.buildUrl}`, 'info');
          }
          return build;

        case 'ERRORED':
          log(`Build FAILED after ~${elapsed} min`, 'error');
          if (build.error) {
            log(`Error: ${build.error.errorCode} — ${build.error.message}`, 'error');
          }
          log(`Fetch logs: node scripts/build.js --logs ${buildId}`, 'info');
          return build;

        case 'CANCELED':
          log('Build was canceled', 'warn');
          return build;

        default:
          process.stdout.write(
            `\r${colors.dim(`[${elapsed}min] Status: ${build.status} | Logs: ${build.logFiles?.length || 0} files | Polling...`)}`
          );
      }
    } catch (e) {
      process.stdout.write(`\r${colors.dim(`[Poll ${polls}] API error: ${e.message} — retrying...`)}`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  log(`Timed out after ${MAX_POLL_MINUTES} minutes. Check manually:`, 'warn');
  log(`  node scripts/build.js --status ${buildId}`, 'info');
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Logs
// ═══════════════════════════════════════════════════════════════

async function fetchLogs(buildId) {
  banner(`Fetching Logs: ${buildId}`);
  
  const build = await getBuildStatus(buildId);
  log(`Status: ${build.status}`, 'info');
  
  if (build.error) {
    log(`Error: ${build.error.errorCode} — ${build.error.message}`, 'error');
  }

  if (!build.logFiles || build.logFiles.length === 0) {
    log('No log files available yet', 'warn');
    return;
  }

  log(`Fetching ${build.logFiles.length} log file(s)...`, 'info');
  
  for (let i = 0; i < build.logFiles.length; i++) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(colors.bold(`LOG FILE ${i + 1}/${build.logFiles.length}`));
    console.log(`${'═'.repeat(60)}`);
    
    try {
      const content = await fetchUrl(build.logFiles[i]);
      // Parse and display structured logs more readably
      const lines = content.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          const level = entry.level >= 50 ? colors.red('ERR') :
                        entry.level >= 40 ? colors.yellow('WRN') :
                        entry.level >= 30 ? colors.dim('INF') : colors.dim('DBG');
          const phase = entry.phase ? colors.blue(`[${entry.phase}]`) : '';
          console.log(`${level} ${phase} ${entry.msg}`);
        } catch {
          console.log(line);
        }
      }
    } catch (e) {
      log(`Failed to fetch log file ${i + 1}: ${e.message}`, 'error');
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Credentials
// ═══════════════════════════════════════════════════════════════

async function showCredentials() {
  banner('EAS Android Credentials');

  try {
    const data = await graphql(`{
      app {
        byFullName(fullName: "@moataz.alsbak/australian-citizenship-test") {
          id
          androidAppCredentials {
            applicationIdentifier
            isLegacy
            androidAppBuildCredentialsList {
              id
              name
              isDefault
              androidKeystore {
                id
                keyAlias
                type
                createdAt
                updatedAt
                md5CertificateFingerprint
              }
            }
          }
        }
      }
    }`);

    const creds = data.app.byFullName.androidAppCredentials;
    if (!creds || creds.length === 0) {
      log('No Android credentials found', 'warn');
      return;
    }

    log(`Found ${creds.length} credential set(s):\n`, 'info');

    for (const cred of creds) {
      const pkg = cred.applicationIdentifier;
      const isCurrent = pkg === EXPECTED_PACKAGE;
      const marker = isCurrent ? colors.green(' ← CURRENT') : '';
      console.log(`${colors.bold(pkg)}${marker}`);

      if (cred.androidAppBuildCredentialsList.length === 0) {
        console.log(`  ${colors.dim('(no build credentials)')}`);
      }

      for (const bc of cred.androidAppBuildCredentialsList) {
        console.log(`  Credential: ${bc.name} ${bc.isDefault ? colors.green('(default)') : ''}`);
        if (bc.androidKeystore) {
          const ks = bc.androidKeystore;
          console.log(`  Keystore ID: ${colors.dim(ks.id)}`);
          console.log(`  Key Alias:   ${ks.keyAlias}`);
          console.log(`  Type:        ${ks.type}`);
          console.log(`  Created:     ${new Date(ks.createdAt).toLocaleDateString()}`);
          if (ks.md5CertificateFingerprint) {
            console.log(`  MD5:         ${ks.md5CertificateFingerprint}`);
          }
        } else {
          console.log(`  Keystore:    ${colors.yellow('NONE')}`);
        }
      }
      console.log('');
    }

    // Google Play signing key reference
    console.log(colors.bold('Google Play Expected Signing Key:'));
    console.log(`  SHA1: CF:1C:17:42:FF:71:E6:5E:6F:EC:98:BD:7A:8A:82:1D:7A:2D:C5:A1`);
    console.log('');
    console.log(colors.bold('Current EAS Keystore Signing Key:'));
    console.log(`  SHA1: 26:32:AE:71:04:6C:6E:79:45:9F:D5:56:D1:4C:88:82:4A:E2:AD:97`);
    console.log('');

    log('If keys don\'t match, see BUILD-TROUBLESHOOTING.md Issue 5', 'info');
    log('To manage credentials interactively: npx eas credentials --platform android', 'info');
  } catch (e) {
    log(`Failed to fetch credentials: ${e.message}`, 'error');
    log('Try: npx eas credentials --platform android', 'info');
  }
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--check') flags.checkOnly = true;
    else if (args[i] === '--status' && args[i + 1]) { flags.status = args[++i]; }
    else if (args[i] === '--logs' && args[i + 1]) { flags.logs = args[++i]; }
    else if (args[i] === '--monitor' && args[i + 1]) { flags.monitor = args[++i]; }
    else if (args[i] === '--platform' && args[i + 1]) { flags.platform = args[++i]; }
    else if (args[i] === '--profile' && args[i + 1]) { flags.profile = args[++i]; }
    else if (args[i] === '--creds') { flags.creds = true; }
    else if (args[i] === '--help' || args[i] === '-h') { flags.help = true; }
  }

  const platform = flags.platform || 'android';
  const profile = flags.profile || 'production';

  if (flags.help) {
    console.log(`
${colors.bold('ACE Build Script')} — Centralized EAS Build Management

${colors.bold('Usage:')}
  node scripts/build.js                      Full build pipeline
  node scripts/build.js --check              Validate only (no build)
  node scripts/build.js --status <id>        Check build status
  node scripts/build.js --logs <id>          Fetch server logs
  node scripts/build.js --monitor <id>       Poll until completion
  node scripts/build.js --platform ios       Build for iOS
  node scripts/build.js --profile preview    Use preview profile
  node scripts/build.js --creds              View EAS credentials & keystores
  node scripts/build.js --help               Show this help

${colors.bold('Examples:')}
  node scripts/build.js                      # Android production build
  node scripts/build.js --platform ios       # iOS production build
  node scripts/build.js --logs abc123-...    # Debug a failed build

${colors.bold('Documentation:')} See BUILD-TROUBLESHOOTING.md
    `);
    return;
  }

  // Handle individual commands
  if (flags.creds) {
    await showCredentials();
    return;
  }

  if (flags.status) {
    const build = await getBuildStatus(flags.status);
    console.log(JSON.stringify(build, null, 2));
    return;
  }

  if (flags.logs) {
    await fetchLogs(flags.logs);
    return;
  }

  if (flags.monitor) {
    await monitorBuild(flags.monitor);
    return;
  }

  // Full build pipeline
  banner('ACE Build Pipeline');
  console.log(`Platform: ${colors.bold(platform)}`);
  console.log(`Profile:  ${colors.bold(profile)}`);
  console.log(`Package:  ${colors.bold(EXPECTED_PACKAGE)}`);
  console.log('');

  // Step 1: Validate
  const checksOk = await runChecks();
  if (!checksOk) {
    process.exit(1);
  }

  if (flags.checkOnly) {
    log('Validation complete. Ready to build!', 'ok');
    return;
  }

  // Step 2: Build
  const buildId = await startBuild(platform, profile);
  if (!buildId) {
    log('Build submission failed', 'error');
    process.exit(1);
  }

  // Step 3: Monitor
  console.log('');
  const result = await monitorBuild(buildId);

  // Step 4: Report
  if (result?.status === 'FINISHED') {
    banner('BUILD SUCCESSFUL');
    if (result.artifacts?.buildUrl) {
      log(`AAB Download URL:`, 'ok');
      console.log(`  ${result.artifacts.buildUrl}`);
    }
    console.log('');
    log('Next steps:', 'step');
    log('  1. Download the AAB from the URL above', 'info');
    log('  2. Upload to Google Play Console', 'info');
    log(`  3. Verify package name is "${EXPECTED_PACKAGE}"`, 'info');
  } else if (result?.status === 'ERRORED') {
    banner('BUILD FAILED');
    log('Run this to debug:', 'step');
    log(`  node scripts/build.js --logs ${buildId}`, 'info');
    log('Then check BUILD-TROUBLESHOOTING.md for known solutions', 'info');
    process.exit(1);
  }
}

main().catch((e) => {
  log(`Unexpected error: ${e.message}`, 'error');
  console.error(e.stack);
  process.exit(1);
});
