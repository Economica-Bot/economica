import path from 'path';
import { fileURLToPath } from 'url';

import './src/env.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	reactStrictMode: true,
	images: {
		domains: ['cdn.discordapp.com']
	},
	typescript: {
		tsconfigPath: './tsconfig.json'
	},
	experimental: {
		outputFileTracingRoot: path.join(__dirname, '../../'),
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
