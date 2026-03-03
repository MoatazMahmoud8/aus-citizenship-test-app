const https = require('https');
const fs = require('fs');
const os = require('os');
const state = JSON.parse(fs.readFileSync(os.homedir() + '/.expo/state.json', 'utf8'));
const token = state.auth?.sessionSecret;

const query = JSON.stringify({
  query: `query {
    app(fullName: "@moataz.alsbak/australian-citizenship-test") {
      id
      builds(filter: { platform: ANDROID }, first: 3) {
        id
        status
        createdAt
        appVersion
        appBuildVersion
      }
    }
  }`
});

const options = {
  hostname: 'api.expo.dev',
  path: '/graphql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'expo-session': token
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    const builds = parsed.data?.app?.builds || [];
    builds.forEach(b => {
      console.log(`Build ${b.id} | Status: ${b.status} | Version: ${b.appVersion} (${b.appBuildVersion}) | ${b.createdAt}`);
    });
  });
});
req.write(query);
req.end();
