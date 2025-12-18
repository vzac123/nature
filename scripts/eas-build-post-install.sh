#!/usr/bin/env bash

set -euo pipefail

echo "=========================================="
echo "🔧 EAS POST-INSTALL HOOK STARTING"
echo "=========================================="

# Safety Check 1: Verify node and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: node is not available"
    exit 1
fi

echo "✅ Node $(node --version) available"
echo "✅ NPM $(npm --version) available"

# Safety Check 2: Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found"
    exit 1
fi

echo "✅ Working directory: $(pwd)"

# Clean existing android folder if it exists
if [ -d "android" ]; then
    echo "⚠️  Removing existing android folder..."
    rm -rf android
fi

# Generate Android folder using expo prebuild
echo "📦 Running expo prebuild for Android..."
npx expo prebuild --platform android --clean --no-install

echo "✅ Android files generated"

# Verify android folder was created
if [ ! -d "android" ]; then
    echo "❌ ERROR: android folder was not created"
    exit 1
fi

# Show original settings.gradle
echo "📄 Original settings.gradle content:"
cat android/settings.gradle
echo "----------------------------------------"

# Create the FIXED settings.gradle
echo "🔨 Replacing settings.gradle with fixed version..."

cat > android/settings.gradle << 'ENDOFFILE'
rootProject.name = 'NatureDailyNew1766060820852'

apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootProject.projectDir).text.trim(), "../scripts/autolinking.gradle")
useExpoModules()

include ':app'
ENDOFFILE

# Verify the fix was applied
echo "📄 NEW settings.gradle content:"
cat android/settings.gradle
echo "----------------------------------------"

if [ ! -s "android/settings.gradle" ]; then
    echo "❌ ERROR: settings.gradle is empty after fix"
    exit 1
fi

echo "✅ settings.gradle successfully replaced"

# Verify critical files exist
if [ ! -f "android/build.gradle" ]; then
    echo "❌ ERROR: android/build.gradle not found"
    exit 1
fi

if [ ! -f "android/app/build.gradle" ]; then
    echo "❌ ERROR: android/app/build.gradle not found"
    exit 1
fi

echo "✅ All critical Android files present"
echo "=========================================="
echo "✅ POST-INSTALL HOOK COMPLETED SUCCESSFULLY"
echo "=========================================="