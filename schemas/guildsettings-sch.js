const mongoose = require('mongoose')


const guildSettingsSchema = mongoose.Schema(
     {
          _id: {
               type: String,
               required: true
        ***REMOVED***
          prefix: {
               type: String,
               required: false
        ***REMOVED***
          incomeWorkMin: {
               type: Number,
               required: true
        ***REMOVED***
          incomeWorkMax: {
               type: Number,
               required: true
        ***REMOVED***
     }
)

module.exports = mongoose.model('Guild', guildSettingsSchema)