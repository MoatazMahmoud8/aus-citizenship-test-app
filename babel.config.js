module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform ES6+ syntax for Hermes V1 (React Native 0.81.5) compatibility
      // Hermes V1 doesn't support ES6 class syntax or ES2022+ features
      ['@babel/plugin-transform-classes', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-transform-logical-assignment-operators'],
      'react-native-reanimated/plugin',
    ],
  };
};


