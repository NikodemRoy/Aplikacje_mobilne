module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: { '^react-native$': 'react-native' }
      }],
      // musi być ostatni
      'react-native-reanimated/plugin'
    ]
  };
};
