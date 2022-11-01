import './src/env.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['cdn.discordapp.com']
	},
	typescript: {
		tsconfigPath: './tsconfig.json'
	},
	experimental: {
		transpilePackages: ['@economica/api', '@economica/db', '@economica/common']
	},
	webpack: (config) => {
		// this will override the experiments
		config.experiments = { ...config.experiments, ...{ topLevelAwait: true } };
		// this will just update topLevelAwait property of config.experiments
		// config.experiments.topLevelAwait = true
		return config;
	}
};

export default nextConfig;
