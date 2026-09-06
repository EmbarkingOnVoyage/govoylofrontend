// Metro's default project root is this app's own directory, so it never
// sees files that live elsewhere in the monorepo — e.g. packages/ui's
// asset imports that reach up to the shared /assets folder at the
// workspace root (`../../../../assets/apple-logo.png` from
// packages/ui/src/assets/index.ts). Without this, Metro fails with
// "Unable to resolve module" for anything outside apps/Mobile.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
