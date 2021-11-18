const mongoose = require('mongoose');

module.exports = async () => {
	const options = {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useFindAndModify: false,
	};

	await mongoose.connect(process.env.MONGOPATH, options);
	return mongoose;
};
