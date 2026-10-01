#!/usr/bin/env node

/**
 * Benta's Funeral Home - Twilio Telecom Gateway CLI Setup
 * Run: node scripts/set-twilio.cjs <ACCOUNT_SID> <AUTH_TOKEN> <PHONE_NUMBER>
 * Or run interactively: node scripts/set-twilio.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

const args = process.argv.slice(2);

function writeEnv(accountSid, authToken, fromNumber) {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  // Update or append keys
  const keys = {
    VITE_TWILIO_ACCOUNT_SID: accountSid.trim(),
    TWILIO_AUTH_TOKEN: authToken.trim(),
    VITE_TWILIO_FROM_NUMBER: fromNumber.trim()
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
  console.log('🕊️  BENTA\'S FUNERAL HOME - TWILIO GATEWAY CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`📱 Account SID:  ${accountSid.trim()}`);
  console.log(`🔑 Auth Token:   ••••••••••••••••••••••••••••••••`);
  console.log(`📞 From Number:  ${fromNumber.trim()}`);
  console.log('======================================================\n');
}

if (args.length >= 3) {
  writeEnv(args[0], args[1], args[2]);
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('🕊️  BENTA\'S FUNERAL HOME - TWILIO CLI CREDENTIAL SETUP');
console.log('======================================================\n');

rl.question('1. Enter Twilio Account SID (starts with AC...): ', (sid) => {
  rl.question('2. Enter Twilio Auth Token / Secret: ', (token) => {
    rl.question('3. Enter Twilio Sender Phone # (e.g. +12122818850 or MG...): ', (num) => {
      writeEnv(sid || '', token || '', num || '+12122818850');
      rl.close();
    });
  });
});
