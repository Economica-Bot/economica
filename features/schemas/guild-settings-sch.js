const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const string = {
    type: String, 
    required: false
}

const guildSettingSchema = mongoose.Schema(
    {
        _id: reqString,
        prefix: string,
        currency: string
    }
)

module.exports = mongoose.model('Guild', guildSettingSchema)