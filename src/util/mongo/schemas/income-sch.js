const mongoose = require('mongoose');

const num = {
	type: Number,
	required: false,
};

const reqString = {
	type: String,
	required: true,
};

const incomeSchema = mongoose.Schema(
	{
		guildID: reqString,
		incomeCommands: [],
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model('incomes', incomeSchema);
