/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	content: ['./src/**/*.{ts,tsx}', './public/**/*.html'],
	colors: {
		discord: {
			900: '#202225',
			800: '#2f3136',
			700: '#36393f',
			600: '#40444b',
			500: '#72767d',
			400: '#829297'
		}
	},
	theme: {
		extend: {
			fontFamily: {
				expletus_sans: ['Expletus Sans', 'sans-serif'],
				lato: ['Lato', 'sans-serif'],
				roboto: ['Roboto', 'sans-serif'],
				economica: ['Economica', 'sans-serif'],
				pt_sans: ['PT Sans', 'sans-serif']
			},
			boxShadow: {
				drop: '0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%), 0px 11px 15px -7px rgb(0 0 0 / 20%)',
				'3xl':
					'0px -24px 38px 3px rgba(0, 0, 0, 0.14), 0px -9px 46px 8px rgba(0, 0, 0, 0.12), 0px -11px 15px -7px rgba(0, 0, 0, 0.2)'
			}
		}
	},
	daisyui: {
		themes: [
			{
				dark: {
					primary: '#6100FF',
					secondary: '#378AA9',
					accent: '#95006E',
					neutral: '#3f3f3f',
					'base-100': '#2C2F33',
					info: '#1192e8',
					success: '#198038',
					warning: '#b28600',
					error: '#fa4d56'
				},
				light: {
					primary: '#5057ff',
					secondary: '#b5ade6',
					accent: '#aad5d5',
					neutral: '#f5f5f7',
					'base-100': '#FFFFFF',
					info: '#7498ba',
					success: '#57f288',
					warning: '#D2691E',
					error: '#ff5050'
				}
			}
		]
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
		function ({ addVariant }) {
			addVariant('children', '& > *');
		}
	]
};
