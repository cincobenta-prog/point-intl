#!/usr/bin/env node

/**
 * Benta's Funeral Home - Live 4K Webcasting Setup
 * Run: node scripts/set-webcast.cjs [PROVIDER] [RTMP_STREAM_KEY] [EMBED_URL] [SECURITY_PIN]
 * Or run interactively: npm run set-webcast
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');
const args = process.argv.slice(2);

function writeEnv(
  provider = 'vimeo_enterprise',
  streamKey = 'live_vimeo_bfh_chapel1_4k_8921',
  embedUrl = 'https://player.vimeo.com/video/108392182?autoplay=1&muted=0&title=0&byline=0',
  pin = '8921',
  rtmpUrl = 'rtmps://live-api-s.vimeo.com:443/rtmp/'
) {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    VITE_WEBCAST_PROVIDER: provider.trim() || 'vimeo_enterprise',
    VITE_WEBCAST_STREAM_KEY: streamKey.trim() || 'live_vimeo_bfh_chapel1_4k_8921',
    VITE_WEBCAST_EMBED_URL: embedUrl.trim() || 'https://player.vimeo.com/video/108392182?autoplay=1&muted=0&title=0&byline=0',
    VITE_WEBCAST_SECURITY_PIN: pin.trim() || '8921',
    VITE_WEBCAST_RTMP_URL: rtmpUrl.trim() || 'rtmps://live-api-s.vimeo.com:443/rtmp/'
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
  console.log('🎥  BENTA\'S FUNERAL HOME - LIVE 4K WEBCASTING CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  console.log(`📡 Webcast Provider:       ${provider}`);
  console.log(`🔑 RTMP Stream Key:        ${streamKey.slice(0, 12)}••••••••`);
  console.log(`🌐 Live Embed URL:         ${embedUrl}`);
  console.log(`🔒 Security PIN:           ${pin}`);
  console.log(`🎛️  RTMP Endpoint:          ${rtmpUrl}`);
  console.log('✨ 4K Chapel 1 PTZ Multi-Cam Broadcast: ONLINE');
  console.log('======================================================\n');
}

if (args.length >= 1) {
  writeEnv(args[0], args[1] || 'live_vimeo_bfh_chapel1_4k_8921', args[2] || 'https://player.vimeo.com/video/108392182?autoplay=1&muted=0&title=0&byline=0', args[3] || '8921');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('🎥  BENTA\'S FUNERAL HOME - LIVE 4K WEBCAST CLI SETUP');
console.log('    Powers Vimeo Enterprise / OneRoom / YouTube Live');
console.log('======================================================\n');

rl.question('1. Enter Provider (vimeo_enterprise | oneroom | youtube_live | custom_rtmp, default: vimeo_enterprise): ', (provider) => {
  rl.question('2. Enter RTMP Stream Key (default: live_vimeo_bfh_chapel1_4k_8921): ', (key) => {
    rl.question('3. Enter Live Channel Embed URL (default: https://player.vimeo.com/video/108392182?autoplay=1&muted=0&title=0&byline=0): ', (url) => {
      rl.question('4. Enter Default Security PIN (default: 8921): ', (pin) => {
        writeEnv(provider || 'vimeo_enterprise', key || 'live_vimeo_bfh_chapel1_4k_8921', url || 'https://player.vimeo.com/video/108392182?autoplay=1&muted=0&title=0&byline=0', pin || '8921');
        rl.close();
      });
    });
  });
});
