const mongoose = require('mongoose')


const economySchema = mongoose.Schema(
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
          }
     }
)

module.exports = mongoose.model('Economy', economySchema)