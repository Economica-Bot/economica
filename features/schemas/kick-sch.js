const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const kickSchema = mongoose.Schema({
    userID: reqString,
    guildID: reqString,
    reason: reqString,
    staffID: reqString,
    staffTag: reqString,
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('kicks', kickSchema)