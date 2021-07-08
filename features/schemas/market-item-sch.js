const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const marketItemSchema = mongoose.Schema({
    userID: reqString, 
    guildID: reqString,
    roleID: reqString,
    item: reqString, 
    price: {
        type: Number, 
        required: true
  ***REMOVED***
    description: reqString
}, )

module.exports = mongoose.model('shop items', marketItemSchema)