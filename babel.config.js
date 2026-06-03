module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform ES2022+ syntax for Hermes V1 (React Native 0.81.5) compatibility
      // These plugins transform private fields, private methods, and other ES2022+ features
      // that Hermes V1's hermesc compiler doesn't natively support
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-transform-logical-assignment-operators'],
      'react-native-reanimated/plugin',
    ],
  };
};


