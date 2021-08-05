const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true,
}

const reqBoolean = {
    type: String, 
    required: true,
}

const reqNumber = {
    type: String, 
    required: true,
}

const infractionSchema = mongoose.Schema({
    guildID: reqString,
    userID: reqString, 
    userTag: reqString, 
    staffID: reqString, 
    staffTag: reqString, 
    type: reqString,
    reason: reqString, 
    permanent: {
        type: Boolean, 
        required: false, 
  ***REMOVED*** 
    active: {
        type: Boolean, 
        required: false,
  ***REMOVED***
    expires: {
        type: Date, 
        required: false,
    }
}, {
    timestamps: true
}, {
    versionKey: false
})

module.exports = mongoose.model('Infractions', infractionSchema)