const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const warnSchema = mongoose.Schema({
    guildID: reqString, 
    userID: reqString, 
    userTag: reqString, 
    staffID: reqString, 
    staffTag: reqString,
    reason: reqString, 
}, {
    timestamps: true
})

module.exports = mongoose.model('warns', warnSchema)