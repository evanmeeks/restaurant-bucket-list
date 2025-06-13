module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./packages/mobile/src', './packages/core/src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@core': './packages/core/src',
            // Remove @env alias to avoid conflict with react-native-dotenv
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env', // Path to your .env file relative to project root
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
