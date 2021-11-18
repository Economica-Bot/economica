const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const guildSettingSchema = mongoose.Schema(
	{
		guildID: reqString,
		modules: [],
		commands: [],
		currency: {
			type: String,
			required: false,
			default: '💵',
		},
		transactionLogChannel: {
			type: String,
			required: false,
		},
		infractionLogChannel: {
			type: String,
			required: false,
		},
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model('guilds', guildSettingSchema);
