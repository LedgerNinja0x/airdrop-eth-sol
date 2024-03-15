import CopyWebpackPlugin from "copy-webpack-plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: "node_modules/geoip-lite/data/geoip-country.dat",
              to: "data/geoip-country.dat",
            },
            {
              from: "node_modules/geoip-lite/data/geoip-country6.dat",
              to: "data/geoip-country6.dat",
            },
          ],
        }),
      );
    }
    return config;
  },
};

module.exports = nextConfig;