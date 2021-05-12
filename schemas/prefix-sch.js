const mongoose = require('mongoose')


const prefixSchema = mongoose.Schema(
     {
          _id: {
               type: String,
               required: false
        ***REMOVED***
          prefix: {
               type: String,
               required: false
          }
     }
)

module.exports = mongoose.model('Guild', prefixSchema)