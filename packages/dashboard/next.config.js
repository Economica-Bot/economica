/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.discordapp.com"],
  },
  experimental: {
    // this includes files from the monorepo base two directories up
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  },
};
