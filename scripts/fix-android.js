#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔨 Fixing settings.gradle...');

const settingsGradlePath = path.join(
  process.cwd(),
  'android',
  'settings.gradle'
);

if (!fs.existsSync(settingsGradlePath)) {
  console.error('❌ settings.gradle not found!');
  process.exit(1);
}

const fixedContent = `rootProject.name = 'NatureDailyNew1766060820852'

apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootProject.projectDir).text.trim(), "../scripts/autolinking.gradle")
useExpoModules()

include ':app'
`;

fs.writeFileSync(settingsGradlePath, fixedContent, 'utf8');
console.log('✅ settings.gradle fixed!');
