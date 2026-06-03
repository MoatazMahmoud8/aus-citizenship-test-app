module.exports = function (api) {
  api.cache(true);
  return {
    // hermes-v0 profile transforms private class fields (#x syntax) which
    // hermesc in RN 0.81.5 cannot compile. hermes-stable skips this transform
    // (assuming Hermes runtime supports it), but the hermesc compiler doesn't.
    presets: [['babel-preset-expo', { unstable_transformProfile: 'hermes-v0' }]],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};


