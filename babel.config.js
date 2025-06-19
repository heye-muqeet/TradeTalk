module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // ✅ Add this line globally
  ],
  env: {
    production: {
      plugins: [
        'react-native-reanimated/plugin', // ✅ Also add in production env
      ],
    },
  },
};
