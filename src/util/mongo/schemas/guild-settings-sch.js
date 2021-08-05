const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const guildSettingSchema = mongoose.Schema({
    guildID: reqString,
    currency: {
        type: String, 
        required: false, 
        default: '💵'
  ***REMOVED***
    transactionLogChannel: {
        type: String, 
        required: false
    }
})

module.exports = mongoose.model('Guild', guildSettingSchema)