import path from 'path';
import { fileURLToPath } from 'url';

import './src/env.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',
	images: {
		domains: ['cdn.discordapp.com']
	},
	experimental: {
		transpilePackages: ['@economica/api', '@economica/db', '@economica/common'],
		// this includes files from the monorepo base two directories up
		outputFileTracingRoot: path.join(__dirname, '../../')
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
