const mongoose = require('mongoose')

const reqString = {
     type: String,
     required: true
}
const guildSettingSchema = mongoose.Schema(
     {
          _id: reqString,
          prefix: {
               type: String,
               required: false
        ***REMOVED***
          currency: {
               type: String,
               required: false
          }
     }
)

module.exports = mongoose.model('Guild', guildSettingSchema)