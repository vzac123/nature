#!/usr/bin/env bash

set -euo pipefail

echo "=========================================="
echo "🔧 EAS POST-INSTALL HOOK STARTING"
echo "=========================================="

# Verify node and npm
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: node is not available"
    exit 1
fi

echo "✅ Node $(node --version) available"
echo "✅ NPM $(npm --version) available"

# Verify package.json
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found"
    exit 1
fi

echo "✅ Working directory: $(pwd)"

# If android folder doesn't exist, generate it
if [ ! -d "android" ]; then
    echo "📦 Generating Android folder with expo prebuild..."
    npx expo prebuild --platform android --clean --no-install
    echo "✅ Android files generated"
fi

# Apply the settings.gradle fix
if [ -f "fix-settings-gradle.js" ]; then
    echo "🔨 Applying settings.gradle fix..."
    node fix-settings-gradle.js
else
    echo "⚠️  fix-settings-gradle.js not found, skipping fix"
fi

# Verify android folder structure
if [ ! -d "android" ]; then
    echo "❌ ERROR: android folder was not created"
    exit 1
fi

if [ ! -f "android/settings.gradle" ]; then
    echo "❌ ERROR: settings.gradle not found"
    exit 1
fi

if [ ! -f "android/build.gradle" ]; then
    echo "❌ ERROR: build.gradle not found"
    exit 1
fi

echo "✅ All critical Android files present"

# Show final settings.gradle for debugging
echo "📄 Final settings.gradle content:"
head -20 android/settings.gradle
echo "..."
echo "----------------------------------------"

echo "=========================================="
echo "✅ POST-INSTALL HOOK COMPLETED SUCCESSFULLY"
echo "=========================================="