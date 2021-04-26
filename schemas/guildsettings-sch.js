const mongoose = require('mongoose')


const guildSettingsSchema = mongoose.Schema(
     {
          _id: {
               type: String,
               required: true
          },
          incomeWorkMin: {
               type: Number,
               required: true
          },
          incomeWorkMax: {
               type: Number,
               required: true
          },
          balance: {
               type: Number,
               required: true
          }
     }
)

module.exports = mongoose.model('Economy', guildSettingsSchema)