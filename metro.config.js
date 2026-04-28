// metro.config.js
// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude macOS system directories that cause EPERM errors
const { blockList } = config.resolver;
const systemPaths = [
  /\/Library\/Group Containers\/.*/,
  /\/Library\/Metadata\/CoreSpotlight\/.*/,
  /\/Library\/Metadata\/com\.apple\.IntelligentSuggestions\/.*/,
  /\/Library\/Caches\/CloudKit\/.*/,
  /\/Library\/Caches\/FamilyCircle\/.*/,
  /\/Library\/Caches\/com\.apple\..*/,
  /\/Library\/Application Support\/com\.apple\.avfoundation\/.*/,
  /\/Library\/Containers\/com\.apple\.Maps\/.*/,
];

config.resolver.blockList = blockList
  ? [
      ...(Array.isArray(blockList) ? blockList : [blockList]),
      ...systemPaths,
    ]
  : systemPaths;

module.exports = config;
