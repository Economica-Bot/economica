const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const inventorySchema = mongoose.Schema(
	{
		userID: reqString,
		guildID: reqString,
		inventory: [],
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

module.exports = mongoose.model('inventories', inventorySchema);
