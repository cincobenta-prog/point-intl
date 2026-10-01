#!/usr/bin/env node

/**
 * Benta's Funeral Home - Commercial Press Fulfillment Setup
 * Run: node scripts/set-press.cjs [PARTNER_EMAIL] [SFTP_HOST] [SFTP_USER] [GELATO_KEY]
 * Or run interactively: npm run set-press
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');
const args = process.argv.slice(2);

function writeEnv(partnerEmail = 'press@harlemheritagepress.com', sftpHost = 'sftp.harlemheritagepress.com', sftpUser = 'benta_harlem_press', gelatoKey = '') {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    VITE_PRESS_PARTNER_EMAIL: partnerEmail.trim() || 'press@harlemheritagepress.com',
    VITE_PRESS_SFTP_HOST: sftpHost.trim() || 'sftp.harlemheritagepress.com',
    VITE_PRESS_SFTP_USER: sftpUser.trim() || 'benta_harlem_press',
    VITE_GELATO_API_KEY: gelatoKey.trim()
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
  console.log('🖨️  BENTA\'S FUNERAL HOME - COMMERCIAL PRESS FULFILLMENT CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`📧 Production Email:       ${partnerEmail || 'press@harlemheritagepress.com'}`);
  console.log(`📁 SFTP Drop Host:         ${sftpHost || 'sftp.harlemheritagepress.com'}`);
  console.log(`👤 SFTP User:              ${sftpUser || 'benta_harlem_press'}`);
  if (gelatoKey) console.log(`☁️  Gelato Cloud Print:     ${gelatoKey.slice(0, 6)}••••••••••••••••`);
  console.log('✨ 300 DPI CMYK Bleed Route: ACTIVE');
  console.log('======================================================\n');
}

if (args.length >= 1) {
  writeEnv(args[0], args[1] || 'sftp.harlemheritagepress.com', args[2] || 'benta_harlem_press', args[3] || '');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('🖨️  BENTA\'S FUNERAL HOME - COMMERCIAL PRESS CLI SETUP');
console.log('    Routes 300 DPI CMYK 4-Panel Programs & Hardcovers');
console.log('======================================================\n');

rl.question('1. Enter Production Email (default: press@harlemheritagepress.com): ', (email) => {
  rl.question('2. Enter SFTP Host (default: sftp.harlemheritagepress.com): ', (host) => {
    rl.question('3. Enter SFTP Username (default: benta_harlem_press): ', (user) => {
      rl.question('4. Enter Gelato / Cloud Print API Key (optional): ', (gelato) => {
        writeEnv(email || 'press@harlemheritagepress.com', host || 'sftp.harlemheritagepress.com', user || 'benta_harlem_press', gelato || '');
        rl.close();
      });
    });
  });
});
