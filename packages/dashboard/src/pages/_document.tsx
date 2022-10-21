import Document, {
	DocumentContext,
	Head,
	Html,
	Main,
	NextScript
} from 'next/document';

class MyDocument extends Document {
	static override async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	override render() {
		return (
			<Html lang='en'>
				<Head />
				<meta charSet='UTF-8' />
				<meta httpEquiv='X-UA-Compatible' content='IE=edge' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />

				{/* Google Font */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=Expletus+Sans:wght@400;700&family=Lato&family=Roboto:wght@100;400;700&family=Economica&family=PT+Sans&display=swap'
					rel='stylesheet'
				/>

				{/* Browser Metadata */}
				<title>Economica</title>
				<link rel='icon' type='image/png' href='/economica.png' />
				<meta property='og:title' content='Economica - Discord Economy Bot' />
				<meta property='og:site_name' content='Economica' />
				<meta
					property='og:description'
					content='The Best New Discord Economy Bot.'
				/>
				<meta property='og:image' content='/assets/economica.png' />
				<meta name='theme-color' content='#8c8ceb' />
				<body className='bg-base-100 font-roboto'>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
