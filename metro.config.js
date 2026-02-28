const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add custom asset extensions for map tiles
config.resolver.assetExts.push('mbtiles', 'pmtiles');

module.exports = withNativeWind(config, { input: './src/global.css' });
