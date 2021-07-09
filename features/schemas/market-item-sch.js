const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const reqNumber = {
    type: Number, 
    required: true
}

const marketItemSchema = mongoose.Schema({
    userID: reqString, 
    guildID: reqString,
    item: reqString, 
    price: {
        type: Number, 
        required: true
  ***REMOVED***
    description: reqString,
    active: {
        type: Boolean,
        required: true
    }
}, {
    timeStamps: true
} )

module.exports = mongoose.model('shop items', marketItemSchema)