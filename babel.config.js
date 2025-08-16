module.exports = function (api) {
  api.cache(true);
  const plugins = [
    'react-native-reanimated/plugin',
    ['react-native-worklets-core/plugin'],
  ];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
