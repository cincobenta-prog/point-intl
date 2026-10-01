#!/usr/bin/env node

/**
 * Benta's Funeral Home - DocuSign Legal E-Signature CLI Setup
 * Run: node scripts/set-docusign.cjs <INTEGRATION_KEY> <ACCOUNT_ID> <CLIENT_SECRET> [RSA_PRIVATE_KEY] [ENVIRONMENT]
 * Or run interactively: node scripts/set-docusign.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

const args = process.argv.slice(2);

function writeEnv(integrationKey, accountId, clientSecret = '', rsaPrivateKey = '', envMode = 'demo', userId = '', baseUri = 'https://demo.docusign.net') {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  // Update or append keys
  const keys = {
    VITE_DOCUSIGN_INTEGRATION_KEY: integrationKey.trim(),
    VITE_DOCUSIGN_ACCOUNT_ID: accountId.trim(),
    DOCUSIGN_CLIENT_SECRET: clientSecret.trim(),
    DOCUSIGN_RSA_PRIVATE_KEY: rsaPrivateKey.trim(),
    VITE_DOCUSIGN_USER_ID: userId.trim(),
    VITE_DOCUSIGN_BASE_URI: baseUri.trim(),
    VITE_DOCUSIGN_ENVIRONMENT: envMode.trim()
  };

  let lines = content.split('\n');
  for (const [key, value] of Object.entries(keys)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');

  console.log('\n======================================================');
  console.log('📜  BENTA\'S FUNERAL HOME - DOCUSIGN GATEWAY CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`🔑 Integration Key (Client ID): ${integrationKey.trim()}`);
  console.log(`🏢 API Account ID:               ${accountId.trim()}`);
  console.log(`🔒 Client Secret:                ••••••••••••••••••••••••••••••••`);
  console.log(`🔐 RSA Private Key:              ${rsaPrivateKey ? 'Configured (PEM format)' : 'None (Using Secret Auth)'}`);
  console.log(`🌐 Environment:                  ${envMode.trim() === 'production' ? 'Production (NA4)' : 'Developer Sandbox (Demo)'}`);
  console.log('======================================================\n');
}

if (args.length >= 3) {
  writeEnv(args[0], args[1], args[2], args[3] || '', args[4] || 'demo');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('📜  BENTA\'S FUNERAL HOME - DOCUSIGN CLI SETUP');
console.log('    Powers Form AP-47, Batesville Disclosures, PHL § 4201');
console.log('======================================================\n');

rl.question('1. Enter DocuSign Integration Key / Client ID (GUID): ', (key) => {
  rl.question('2. Enter DocuSign API Account ID (GUID): ', (accId) => {
    rl.question('3. Enter DocuSign Client Secret (or Secret Key): ', (secret) => {
      rl.question('4. Enter RSA Private Key (optional for JWT Grants): ', (rsaKey) => {
        rl.question('5. Environment [demo/production] (default: demo): ', (envChoice) => {
          writeEnv(key || '', accId || '', secret || '', rsaKey || '', envChoice || 'demo');
          rl.close();
        });
      });
    });
  });
});
