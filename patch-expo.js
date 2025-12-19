const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/permissions/PermissionsService.kt'
);

console.log('========================================');
console.log('EXPO MODULES CORE PATCH SCRIPT');
console.log('========================================');
console.log('Looking for file:', filePath);

if (!fs.existsSync(filePath)) {
  console.log('❌ File not found - skipping patch');
  process.exit(0);
}

console.log('✓ File found, reading content...');
let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('permissions?.filter') || content.includes('?: emptyList()')) {
  console.log('✓ File already patched - skipping');
  process.exit(0);
}

console.log('Applying patch...');

// Find and replace the problematic line
const originalPattern = /val missingPermissions = permissions\.filter \{[\s\S]*?\n    \}/;
const match = content.match(originalPattern);

if (!match) {
  console.log('❌ Could not find pattern to patch');
  console.log('Looking for: val missingPermissions = permissions.filter {');
  process.exit(1);
}

console.log('Found pattern to patch');

// Replace with null-safe version
content = content.replace(
  originalPattern,
  match[0].replace('permissions.filter', 'permissions?.filter') + ' ?: emptyList()'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Patch applied successfully!');
console.log('========================================');
