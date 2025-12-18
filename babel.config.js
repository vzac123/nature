module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Only add react-native-reanimated if you use it
      'react-native-reanimated/plugin',
    ],
  };
};
