const mongoose = require('mongoose')

const reqString = {
     type: String,
     required: true
}
const guildSettingSchema = mongoose.Schema(
     {
          _id: reqString,
          prefix: reqString
     }
)

module.exports = mongoose.model('Guild', guildSettingSchema)