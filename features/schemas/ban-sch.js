const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const banSchema = mongoose.Schema({
    userID: reqString,
    guildID: reqString,
    reason: reqString,
    staffID: reqString,
    staffTag: reqString,
    current: {
        type: Boolean,
        required: true,
  ***REMOVED***
    expired: {
        type: Boolean,
        required: true,
  ***REMOVED***
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('bans', banSchema)