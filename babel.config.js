module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform ES2022+ syntax so Hermes V1 (React Native 0.81.5) can compile.
      // Hermes V1's hermesc rejects getters/setters and private fields.
      // Note: babel-preset-expo's hermes-v1 config intentionally doesn't include
      // these plugins, assuming native support. Must override here.
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      'react-native-reanimated/plugin',
    ],
  };
};
