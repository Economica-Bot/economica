const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const reqBoolean = {
    type: Boolean, 
    required: true
}

const banSchema = mongoose.Schema({
    guildID: reqString,
    userID: reqString,
    userTag: reqString,
    staffID: reqString,
    staffTag: reqString,
    reason: reqString,
    active: reqBoolean,
}, {
    timestamps: true
})

module.exports = mongoose.model('bans', banSchema)