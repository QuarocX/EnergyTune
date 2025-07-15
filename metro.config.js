const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for transformers.js and React Native compatibility
config.resolver.alias = {
  ...config.resolver.alias,
  'sharp$': 'sharp/lib',
};

// Add binary file extensions for AI models
config.resolver.assetExts = [
  ...config.resolver.assetExts, 
  'bin', 
  'ort',
  'onnx',
];

// Add support for .mjs files (ES modules)
config.resolver.sourceExts = [
  ...config.resolver.sourceExts, 
  'mjs',
];

// Add transformer options for better compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
