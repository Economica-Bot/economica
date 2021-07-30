const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const reqNumber = {
    type: Number, 
    required: true,
    default: 0
}

const commandParams = {}

const econSchema = mongoose.Schema({
    guildID: reqString,
    userID: reqString,
    wallet: reqNumber,
    treasury: reqNumber,
    networth: reqNumber, 
    commands: {
        work: commandParams,
        beg: commandParams,
        crime: commandParams,
        rob: commandParams,
        coinflip: commandParams,
        craps: commandParams
    }
})

module.exports = mongoose.model('Economy', econSchema)