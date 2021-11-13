const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const reqNumber = {
	type: Number,
	required: true,
	default: 0,
};

const econSchema = mongoose.Schema(
	{
		guildID: reqString,
		userID: reqString,
		wallet: reqNumber,
		treasury: reqNumber,
		total: reqNumber,
		commands: [],
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model('economies', econSchema);
