#!/usr/bin/env node

/**
 * Benta's Funeral Home - Cloud Database & Object Storage CLI Setup
 * Run: node scripts/set-cloud.cjs <SUPABASE_URL> <SUPABASE_ANON_KEY> [S3_BUCKET] [AWS_ACCESS_KEY] [AWS_SECRET_KEY] [AWS_REGION]
 * Or run interactively: npm run set-cloud
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');
const args = process.argv.slice(2);

function writeEnv(supabaseUrl = '', supabaseAnonKey = '', s3Bucket = 'bfh-golden-records-vault', awsKey = '', awsSecret = '', awsRegion = 'us-east-1', databaseUrl = '') {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    VITE_SUPABASE_URL: supabaseUrl.trim(),
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey.trim(),
    VITE_S3_BUCKET_NAME: s3Bucket.trim(),
    AWS_ACCESS_KEY_ID: awsKey.trim(),
    AWS_SECRET_ACCESS_KEY: awsSecret.trim(),
    VITE_AWS_REGION: awsRegion.trim(),
    DATABASE_URL: databaseUrl.trim() || (supabaseUrl ? `postgresql://postgres:********@${supabaseUrl.replace('https://', '').split('.')[0]}.supabase.co:5432/postgres` : '')
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
  console.log('☁️  BENTA\'S FUNERAL HOME - CLOUD & STORAGE CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  if (supabaseUrl) console.log(`🗄️  Supabase Database URL:   ${supabaseUrl.trim()}`);
  if (supabaseAnonKey) console.log(`🔑 Supabase Anon API Key:  ${supabaseAnonKey.slice(0, 10)}...`);
  if (s3Bucket) console.log(`📦 S3 Storage Bucket:      ${s3Bucket.trim()}`);
  if (awsKey) console.log(`🔒 AWS Access Key ID:      ${awsKey.slice(0, 6)}...`);
  if (awsRegion) console.log(`🌐 AWS Storage Region:      ${awsRegion.trim()}`);
  console.log('======================================================\n');
}

if (args.length >= 2) {
  writeEnv(args[0], args[1], args[2] || 'bfh-golden-records-vault', args[3] || '', args[4] || '', args[5] || 'us-east-1');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('☁️  BENTA\'S FUNERAL HOME - CLOUD & STORAGE CLI SETUP');
console.log('    Powers Multi-Device Real-Time Sync & S3 Media Vault');
console.log('======================================================\n');

rl.question('1. Enter Supabase Project URL (e.g. https://xxx.supabase.co): ', (url) => {
  rl.question('2. Enter Supabase Anon Public API Key: ', (anonKey) => {
    rl.question('3. Enter S3 Storage Bucket Name (default: bfh-golden-records-vault): ', (bucket) => {
      rl.question('4. Enter AWS S3 Access Key ID (optional): ', (awsKey) => {
        rl.question('5. Enter AWS S3 Secret Access Key (optional): ', (awsSecret) => {
          rl.question('6. Enter AWS Region (default: us-east-1): ', (region) => {
            writeEnv(url, anonKey, bucket || 'bfh-golden-records-vault', awsKey, awsSecret, region || 'us-east-1');
            rl.close();
          });
        });
      });
    });
  });
});
