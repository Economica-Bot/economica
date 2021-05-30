const mongoose = require('mongoose')

// retrieve user-specific stats for a command
commandParams = {
    // when the user last used the command
    // purpose: dynamic per-server cooldowns (ref: income-sch.js)
    timestamp: { type: Number}
}

const economyBalSchema = mongoose.Schema(
    {
        guildID: {
            type: String,
            required: true
      ***REMOVED***
        userID: {
            type: String,
            required: true
      ***REMOVED***
        balance: {
            type: Number,
            required: true
      ***REMOVED***
        commands: {
            work: commandParams,
            beg: commandParams,
            crime: commandParams
        }
    }
)

module.exports = mongoose.model('Economy', economyBalSchema)