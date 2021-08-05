const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const reqNumber = {
    type: Number, 
    required: true
}

const reqBoolean = {
    type: Boolean, 
    required: true
}

const marketItemSchema = mongoose.Schema({
    userID: reqString, 
    guildID: reqString,
    item: reqString, 
    price: reqNumber,
    description: reqString,
    active: reqBoolean
}, {
    timeStamps: true
}, {
    versionKey: false
})

module.exports = mongoose.model('market', marketItemSchema)