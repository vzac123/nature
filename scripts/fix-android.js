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

const fixedContent = `pluginManagement {
    def getNodeModulePath = { packageName ->
        def process = ['node', '--print', "require.resolve('\${packageName}')"].execute(null, rootDir)
        process.waitFor()
        def output = process.text.trim()
        if (output == null || output.isEmpty() || output == '/') {
            throw new GradleException("Failed to resolve \${packageName} - got invalid path: '\${output}'")
        }
        return output
    }
    
    includeBuild(new File(getNodeModulePath('@react-native/gradle-plugin/package.json')).getParentFile())
    
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
}

rootProject.name = 'NatureDailyNew1766060820852'

dependencyResolutionManagement {
    versionCatalogs {
        reactAndroidLibs {
            def getNodeModulePath = { packageName ->
                def process = ['node', '--print', "require.resolve('\${packageName}')"].execute(null, rootDir)
                process.waitFor()
                return process.text.trim()
            }
            
            def rnPackageJson = new File(getNodeModulePath('react-native/package.json'))
            def rnRoot = rnPackageJson.getParentFile().getAbsolutePath()
            from(files("\${rnRoot}/gradle/libs.versions.toml"))
        }
    }
}

def getNodeModulePath = { packageName ->
    def process = ['node', '--print', "require.resolve('\${packageName}')"].execute(null, rootDir)
    process.waitFor()
    def output = process.text.trim()
    if (output == null || output.isEmpty() || output == '/') {
        throw new GradleException("Failed to resolve \${packageName} - got invalid path: '\${output}'")
    }
    return output
}

apply from: new File(getNodeModulePath('expo/package.json'), "../scripts/autolinking.gradle")
useExpoModules()

apply from: new File(getNodeModulePath('@react-native-community/cli-platform-android/package.json'), "../native_modules.gradle")
applyNativeModulesSettingsGradle(settings)

include ':app'
`;

fs.writeFileSync(settingsGradlePath, fixedContent, 'utf8');
console.log('✅ settings.gradle fixed with error handling!');
