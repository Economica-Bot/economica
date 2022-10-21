import transpiler from 'next-transpile-modules';
import path from 'path';
import url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ['cdn.discordapp.com']
	},
	experimental: {
		// this includes files from the monorepo base two directories up
		outputFileTracingRoot: path.join(__dirname, '../../')
	}
};

const withTM = transpiler(['@economica/bot']);
export default withTM(nextConfig);
