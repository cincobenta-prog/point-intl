/**
 * CLI Configuration Script for Intuit QuickBooks Online (QBO) Invoicing & General Ledger Sync
 * Usage: node scripts/set-qbo.cjs [clientId] [clientSecret] [realmId]
 */

const fs = require('fs');
const path = require('path');

const clientId = process.argv[2] || 'AB1234567890qboBentaHarlemPrime8850';
const clientSecret = process.argv[3] || 'sk_live_qbo_sec_9948197728340192';
const realmId = process.argv[4] || '9341452938102914';

const envPath = path.join(__dirname, '..', '.env.local');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

function upsertEnvVar(content, key, val) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${val}`);
  }
  return content.trim() ? `${content.trim()}\n${key}=${val}` : `${key}=${val}`;
}

envContent = upsertEnvVar(envContent, 'VITE_QBO_CLIENT_ID', clientId);
envContent = upsertEnvVar(envContent, 'QBO_CLIENT_SECRET', clientSecret);
envContent = upsertEnvVar(envContent, 'VITE_QBO_REALM_ID', realmId);
envContent = upsertEnvVar(envContent, 'VITE_QBO_COMPANY_NAME', "Benta's Funeral Home, Inc.");
envContent = upsertEnvVar(envContent, 'VITE_QBO_ENVIRONMENT', 'production');

fs.writeFileSync(envPath, envContent + '\n', 'utf8');

console.log('====================================================');
console.log('✅ Intuit QuickBooks Online (QBO) Credentials Configured');
console.log('====================================================');
console.log(`Company / Realm ID : ${realmId} (Benta's Funeral Home, Inc.)`);
console.log(`App Client ID      : ${clientId}`);
console.log(`Client Secret      : ${clientSecret.slice(0, 10)}... (Masked)`);
console.log(`Environment        : Production / Live API`);
console.log(`Config written to  : ${envPath}`);
console.log('====================================================');
