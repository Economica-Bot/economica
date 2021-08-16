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
  ***REMOVED***
    transactionLogChannel: {
      type: String,
      required: false,
  ***REMOVED***
    infractionLogChannel: {
      type: String,
      required: false,
  ***REMOVED***
***REMOVED***
  {
    versionKey: false,
  }
);

module.exports = mongoose.model('guilds', guildSettingSchema);
