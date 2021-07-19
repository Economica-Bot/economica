const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const reqNumber = {
    type: Number, 
    required: true
}

// retrieve user-specific stats for a command
commandParams = {
    // when the user last used the command
    // purpose: dynamic per-server cooldowns (ref: income-sch.js)
    timestamp: { type: Number}
}

const econSchema = mongoose.Schema(
    {
        guildID: reqString,
        userID: reqString,
        wallet: reqNumber,
        treasury: reqNumber,
        networth: reqNumber, 
        commands: {
            work: commandParams,
            beg: commandParams,
            crime: commandParams
        }
    }
)

module.exports = mongoose.model('Economy', econSchema)