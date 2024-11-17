const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const sentryConfig = getSentryExpoConfig(__dirname);

const combinedConfig = {
  ...config,
  ...sentryConfig,
  resolver: {
    ...config.resolver,
    ...sentryConfig.resolver,
  },
};

module.exports = withNativeWind(combinedConfig, { input: "./app/global.css" });

// const config = getSentryExpoConfig(__dirname);

// module.exports = config;
