const mongoose = require('mongoose')


const guildSettingsSchema = mongoose.Schema(
     {
          _id: {
               type: String,
               required: true
        ***REMOVED***
          incomeWorkMin: {
               type: Number,
               required: true
        ***REMOVED***
          incomeWorkMax: {
               type: Number,
               required: true
        ***REMOVED***
          balance: {
               type: Number,
               required: true
          }
     }
)

module.exports = mongoose.model('Economy', guildSettingsSchema)