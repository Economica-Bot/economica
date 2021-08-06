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
    timestamps: true,
    versionKey: false
})

module.exports = mongoose.model('transactions', transactionSchema)
