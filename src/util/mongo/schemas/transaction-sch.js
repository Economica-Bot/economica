const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const reqNumber = {
    type: Number, 
    required: true
}

const transactionSchema = mongoose.Schema({
    guildID: reqString,
    userID: reqString,
    transaction_type: reqString, 
    memo: reqString,
    wallet: reqNumber, 
    treasury: reqNumber,
    networth: reqNumber,
}, {
    timeStamps: true
})

module.exports = mongoose.model('Transactions', transactionSchema)
