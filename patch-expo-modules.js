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
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix line 166: Change permissions[i] to permissions?.get(i) or permissions!![i]
  // The issue is accessing a nullable array without safe call
  const originalLine = 'permissions[i]';
  const fixedLine = 'permissions!![i]';
  
  if (content.includes(originalLine)) {
    content = content.replace(
      new RegExp('permissions\\[i\\]', 'g'),
      'permissions!![i]'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully patched PermissionsService.kt');
  } else {
    console.log('⚠️  Could not find the exact pattern to patch');
  }
} catch (error) {
  console.error('❌ Error patching file:', error.message);
  process.exit(0); // Don't fail the install
}
