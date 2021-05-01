const mongoose = require('mongoose')


const guildSettingsSchema = mongoose.Schema(
     {
          _id: {
               type: String,
               required: true
          },
          prefix: {
               type: String,
               required: false
          },
          incomeWorkMin: {
               type: Number,
               required: true
          },
          incomeWorkMax: {
               type: Number,
               required: true
          },
     }
)

module.exports = mongoose.model('Guild', guildSettingsSchema)