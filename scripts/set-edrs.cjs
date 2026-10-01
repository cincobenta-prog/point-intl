#!/usr/bin/env node

/**
 * Benta's Funeral Home - Vital Statistics & Regulatory Electronic Filing CLI Setup
 * Run: node scripts/set-edrs.cjs <LFD_NYC_ID> <ESTABLISHMENT_PERMIT> <HCS_TOKEN> [JURISDICTION] [ENVIRONMENT]
 * Or run interactively: node scripts/set-edrs.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');

const args = process.argv.slice(2);

function writeEnv(lfdId, estPermit, hcsToken = '', jurisdiction = 'nyc_dohmh_5boroughs', envMode = 'production') {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    VITE_EDRS_LFD_NYC_ID: lfdId.trim(),
    VITE_EDRS_ESTABLISHMENT_PERMIT: estPermit.trim(),
    EDRS_HCS_TOKEN: hcsToken.trim(),
    VITE_EDRS_JURISDICTION: jurisdiction.trim(),
    VITE_EDRS_ENVIRONMENT: envMode.trim()
  };

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
  console.log('🏛️  BENTA\'S FUNERAL HOME - NYC eVITAL / NYS HCS CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`👤 LFD NYC ID:                 ${lfdId.trim()}`);
  console.log(`🏢 Facility Establishment #:   ${estPermit.trim()}`);
  console.log(`🔑 NYS HCS Director Token:     ${hcsToken.trim() ? '••••••••••••••••••••••••••••••••' : 'None'}`);
  console.log(`🗺️ Jurisdiction:               ${jurisdiction.trim() === 'nyc_dohmh_5boroughs' ? 'NYC DOHMH eVital (5 Boroughs)' : 'NYS Health Commerce System (Outside NYC)'}`);
  console.log(`🌐 Environment:                ${envMode.trim().toUpperCase()}`);
  console.log('======================================================\n');
}

if (args.length >= 2) {
  writeEnv(args[0], args[1], args[2] || '', args[3] || 'nyc_dohmh_5boroughs', args[4] || 'production');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('🏛️  BENTA\'S FUNERAL HOME - NYC EDRS / NYS HCS SETUP');
console.log('    Powers eVital Death Certificates & 72-Hour Transit Permits');
console.log('======================================================\n');

rl.question('1. Enter Licensed Funeral Director (LFD) NYC ID (e.g. NYC-LFD-08850-BC): ', (lfd) => {
  rl.question('2. Enter BFH Facility / Establishment Permit # (e.g. EST-BFH-NY-10027-08850): ', (est) => {
    rl.question('3. Enter NYS HCS Director Account Token (optional): ', (token) => {
      rl.question('4. Jurisdiction [nyc_dohmh_5boroughs / nys_hcs_outside_nyc] (default: nyc_dohmh_5boroughs): ', (jur) => {
        writeEnv(lfd || 'NYC-LFD-08850-BC', est || 'EST-BFH-NY-10027-08850', token || 'HCS-SEC-TOK-99824-NYSDOH', jur || 'nyc_dohmh_5boroughs');
        rl.close();
      });
    });
  });
});
