const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/permissions/PermissionsService.kt'
);

if (fs.existsSync(filePath)) {
  console.log('Patching expo-modules-core PermissionsService.kt...');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the problematic line - make permissions nullable and provide fallback
  content = content.replace(
    /val missingPermissions = permissions\.filter \{/g,
    'val missingPermissions = permissions?.filter {'
  );
  
  // Add the null fallback after the closing brace
  content = content.replace(
    /(val missingPermissions = permissions\?\.filter \{[\s\S]*?\n    \})/g,
    '$1 ?: emptyList()'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Patch applied successfully!');
} else {
  console.log('⚠️  File not found, skipping patch');
}
