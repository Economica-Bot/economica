/** @type {import('prettier').Config} */
module.exports = {
	...require('../../.prettierrc.cjs'),
	plugins: [require('prettier-plugin-tailwindcss')],
	tailwindConfig: './tailwind.config.cjs'
};
