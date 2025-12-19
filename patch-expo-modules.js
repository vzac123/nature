const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'node_modules',
  'expo-modules-core',
  'android',
  'src',
  'main',
  'java',
  'expo',
  'modules',
  'adapters',
  'react',
  'permissions',
  'PermissionsService.kt'
);

console.log('Patching expo-modules-core PermissionsService.kt...');

try {
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  File not found yet, will patch on next install');
    process.exit(0);
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all instances of permissions[i] with permissions!![i]
  const originalPattern = /permissions\[i\]/g;
  const replacement = 'permissions!![i]';
  
  if (originalPattern.test(content)) {
    content = content.replace(originalPattern, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully patched PermissionsService.kt');
  } else if (content.includes('permissions!![i]')) {
    console.log('✅ File already patched');
  } else {
    console.log('⚠️  Pattern not found in file');
  }
} catch (error) {
  console.error('❌ Error patching file:', error.message);
  process.exit(0); // Don't fail the install
}
