const mongoose = require('mongoose')


const economySchema = mongoose.Schema(
     {
          guildID: {
               type: String,
               required: true
          },
          userID: {
               type: String,
               required: true
          },
          balance: {
               type: Number,
               required: true
          }
     }
)

module.exports = mongoose.model('Economy', economySchema)