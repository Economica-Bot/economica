const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const guildSettingSchema = mongoose.Schema(
	{
		guildID: reqString,
		disabled: {
			type: Boolean,
			required: true,
			default: false,
		},
		channels: [],
		roles: [],
		cooldown: {
			type: Number,
			required: true,
			default: 5000,
		},
		modules: [],
		commands: [],
		currency: {
			type: String,
			required: true,
			default: '💵',
		},
		transactionLogChannel: {
			type: String,
			required: true,
		},
		infractionLogChannel: {
			type: String,
			required: true,
		},
	},
	{
		versionKey: false,
	}
);

module.exports = mongoose.model('guilds', guildSettingSchema);
