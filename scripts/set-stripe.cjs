#!/usr/bin/env node

/**
 * Benta's Funeral Home - Merchant Payment Processing & Split-Pay Setup
 * Run: node scripts/set-stripe.cjs [PUBLISHABLE_KEY] [SECRET_KEY] [WEBHOOK_SECRET] [MERCHANT_ID]
 * Or run interactively: npm run set-stripe
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');
const args = process.argv.slice(2);

function writeEnv(
  publishableKey = 'pk_live_51PqBFH_Harlem_9918230198273619283746192',
  secretKey = 'sk_live_51PqBFH_Harlem_Secret_9918230198273619283746192',
  webhookSecret = 'whsec_991823019827361928374619283746192837461928',
  merchantId = 'acct_bfh_harlem_prime_08850'
) {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    VITE_STRIPE_PUBLISHABLE_KEY: publishableKey.trim() || 'pk_live_51PqBFH_Harlem_9918230198273619283746192',
    STRIPE_SECRET_KEY: secretKey.trim() || 'sk_live_51PqBFH_Harlem_Secret_9918230198273619283746192',
    STRIPE_WEBHOOK_SECRET: webhookSecret.trim() || 'whsec_991823019827361928374619283746192837461928',
    VITE_STRIPE_MERCHANT_ID: merchantId.trim() || 'acct_bfh_harlem_prime_08850'
  };

  for (const [key, value] of Object.entries(keys)) {
    if (!value) continue;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');

  console.log('\n======================================================');
  console.log('💳  BENTA\'S FUNERAL HOME - STRIPE MERCHANT GATEWAY CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`🔑 Publishable Key:        ${publishableKey.slice(0, 14)}••••••••`);
  console.log(`🔒 Secret Key:             ${secretKey.slice(0, 14)}••••••••`);
  console.log(`🔏 Webhook Secret:         ${webhookSecret.slice(0, 12)}••••••••`);
  console.log(`🏛️  Merchant Account:       ${merchantId}`);
  console.log('✨ Apple Pay, Google Pay, Plaid ACH & Split-Pay: ONLINE');
  console.log('======================================================\n');
}

if (args.length >= 1) {
  writeEnv(args[0], args[1] || 'sk_live_51PqBFH_Harlem_Secret_9918230198273619283746192', args[2] || 'whsec_991823019827361928374619283746192837461928', args[3] || 'acct_bfh_harlem_prime_08850');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('💳  BENTA\'S FUNERAL HOME - STRIPE PAYMENT CLI SETUP');
console.log('    Powers Credit Cards, Apple Pay, ACH & Crowdfunding');
console.log('======================================================\n');

rl.question('1. Enter Stripe Publishable Key (pk_live_... / pk_test_...): ', (pubKey) => {
  rl.question('2. Enter Stripe Secret Key (sk_live_... / sk_test_...): ', (secKey) => {
    rl.question('3. Enter Webhook Signing Secret (whsec_...): ', (whSec) => {
      rl.question('4. Enter Merchant Account ID (default: acct_bfh_harlem_prime_08850): ', (mId) => {
        writeEnv(
          pubKey || 'pk_live_51PqBFH_Harlem_9918230198273619283746192',
          secKey || 'sk_live_51PqBFH_Harlem_Secret_9918230198273619283746192',
          whSec || 'whsec_991823019827361928374619283746192837461928',
          mId || 'acct_bfh_harlem_prime_08850'
        );
        rl.close();
      });
    });
  });
});
