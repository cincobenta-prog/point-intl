#!/usr/bin/env node

/**
 * Benta's Funeral Home - AI & Voice Transcription CLI Setup
 * Run: node scripts/set-ai.cjs <OPENAI_API_KEY> [MODEL] [GEMINI_API_KEY] [ANTHROPIC_API_KEY]
 * Or run interactively: npm run set-ai
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(process.cwd(), '.env.local');
const args = process.argv.slice(2);

function writeEnv(openaiKey = '', model = 'gpt-4o', geminiKey = '', anthropicKey = '') {
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const keys = {
    OPENAI_API_KEY: openaiKey.trim(),
    VITE_AI_MODEL: model.trim() || 'gpt-4o',
    GEMINI_API_KEY: geminiKey.trim(),
    ANTHROPIC_API_KEY: anthropicKey.trim()
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
  console.log('🤖  BENTA\'S FUNERAL HOME - AI GATEWAY CONFIGURED');
  console.log('======================================================');
  console.log(`✅ Saved to: ${envPath}`);
  if (openaiKey) console.log(`🔑 OpenAI API Key:         ${openaiKey.slice(0, 7)}••••••••••••••••••••`);
  console.log(`🧠 AI Engine Model:        ${model.trim() || 'gpt-4o'}`);
  if (geminiKey) console.log(`✨ Google Gemini Key:      ${geminiKey.slice(0, 6)}••••••••••••••••`);
  if (anthropicKey) console.log(`🛡️  Anthropic Claude Key:   ${anthropicKey.slice(0, 6)}••••••••••••••••`);
  console.log('======================================================\n');
}

if (args.length >= 1) {
  writeEnv(args[0], args[1] || 'gpt-4o', args[2] || '', args[3] || '');
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================================');
console.log('🤖  BENTA\'S FUNERAL HOME - AI GATEWAY CLI SETUP');
console.log('    Powers 24/7 Family Concierge, Obituary AI & Whisper');
console.log('======================================================\n');

rl.question('1. Enter OpenAI API Key (starts with sk-): ', (openAi) => {
  rl.question('2. Preferred Model [gpt-4o / gemini-1.5-pro / claude-3-5-sonnet] (default: gpt-4o): ', (modelChoice) => {
    rl.question('3. Enter Google Gemini API Key (optional): ', (gemini) => {
      rl.question('4. Enter Anthropic Claude API Key (optional): ', (anthropic) => {
        writeEnv(openAi, modelChoice || 'gpt-4o', gemini || '', anthropic || '');
        rl.close();
      });
    });
  });
});
