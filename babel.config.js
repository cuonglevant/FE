module.exports = function (api) {
  api.cache(true);
  const plugins = [
    ['react-native-worklets-core/plugin'],
    // NOTE: Reanimated plugin must be listed last
    'react-native-reanimated/plugin',
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
