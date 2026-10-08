const { withAppBuildGradle } = require('expo/config-plugins');

// Signs local release builds with the upload key when GOVOYLO_UPLOAD_* properties
// are set in ~/.gradle/gradle.properties; falls back to the debug key otherwise.
// EAS cloud builds inject their own signing config and are unaffected.
const RELEASE_SIGNING = `
        release {
            if (project.hasProperty('GOVOYLO_UPLOAD_STORE_FILE')) {
                storeFile file(GOVOYLO_UPLOAD_STORE_FILE)
                storePassword GOVOYLO_UPLOAD_STORE_PASSWORD
                keyAlias GOVOYLO_UPLOAD_KEY_ALIAS
                keyPassword GOVOYLO_UPLOAD_KEY_PASSWORD
            }
        }`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    let gradle = cfg.modResults.contents;
    if (gradle.includes('GOVOYLO_UPLOAD_STORE_FILE')) return cfg;
    gradle = gradle.replace(
      /(signingConfigs \{\s*debug \{[^}]*\})/,
      `$1${RELEASE_SIGNING}`
    );
    gradle = gradle.replace(
      /(release \{\s*(?:\/\/[^\n]*\n\s*)*)signingConfig signingConfigs\.debug/,
      "$1signingConfig project.hasProperty('GOVOYLO_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug"
    );
    cfg.modResults.contents = gradle;
    return cfg;
  });
};
