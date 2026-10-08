const { withAndroidManifest } = require('expo/config-plugins');

// Targeting API 36 turns on predictive back, which stops Android 16 from delivering
// back presses to React Native's handler. Opt out until we move to an SDK that supports it.
module.exports = function withBackCallbackOptOut(config) {
  return withAndroidManifest(config, (cfg) => {
    const app = cfg.modResults.manifest.application[0];
    app.$['android:enableOnBackInvokedCallback'] = 'false';
    return cfg;
  });
};
