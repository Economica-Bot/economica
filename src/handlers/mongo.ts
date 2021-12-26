const mongoose = require('mongoose');

export const name = 'mongoose';

export async function execute() {
	const options = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false,
	};

	await mongoose.connect(process.env.MONGOPATH, options);
}
