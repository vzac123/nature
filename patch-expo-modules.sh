#!/bin/bash
FILE="node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/permissions/PermissionsService.kt"

if [ -f "$FILE" ]; then
    echo "Patching expo-modules-core PermissionsService.kt..."
    sed -i 's/val missingPermissions = permissions\.filter {/val missingPermissions = permissions?\.filter {/' "$FILE"
    sed -i 's/} ?: emptyList()/}/' "$FILE"
    sed -i '/val missingPermissions = permissions?\.filter {/a\    } ?: emptyList()' "$FILE"
    echo "Patch applied successfully!"
else
    echo "File not found: $FILE"
    exit 1
fi
