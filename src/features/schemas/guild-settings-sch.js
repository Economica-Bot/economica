const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const guildSettingSchema = mongoose.Schema({
    guildID: reqString,
    prefix: {
        type: String, 
        required: false, 
        default: '.'
  ***REMOVED***
    currency: {
        type: String, 
        required: false, 
        default: '💵'
    }
})

module.exports = mongoose.model('Guild', guildSettingSchema)