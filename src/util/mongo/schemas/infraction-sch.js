const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const reqBoolean = {
	type: String,
	required: true,
};

const reqNumber = {
	type: String,
	required: true,
};

const infractionSchema = mongoose.Schema(
	{
		guildID: reqString,
		userID: reqString,
		staffID: reqString,
		type: reqString,
		reason: reqString,
		permanent: {
			type: Boolean,
			required: false,
		},
		active: {
			type: Boolean,
			required: false,
		},
		expires: {
			type: Date,
			required: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model('infractions', infractionSchema);
