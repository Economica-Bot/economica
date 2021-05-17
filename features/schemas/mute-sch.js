const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const muteSchema = mongoose.Schema({
    userID: reqString,
    guildID: reqString,
    reason: reqString,
    staffID: reqString,
    staffTag: reqString,
    expires: {
        type: Date,
        required: true
  ***REMOVED***
    current: {
        type: Boolean,
        required: true,
  ***REMOVED***
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('mutes', muteSchema)