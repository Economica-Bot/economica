const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const reqBoolean = {
    type: Boolean, 
    required: true
}

const muteSchema = mongoose.Schema({
    guildID: reqString,
    userID: reqString,
    userTag: reqString,
    staffID: reqString,
    staffTag: reqString,
    reason: reqString,
    permanent: reqBoolean,
    active: reqBoolean,
    expires: {
        type: Date,
        required: false
  ***REMOVED***
}, {
    timestamps: true
})

module.exports = mongoose.model('mutes', muteSchema)