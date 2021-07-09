const mongoose = require('mongoose')

const reqString = {
    type: String, 
    required: true
}

const inventorySchema = mongoose.Schema({
    userID: reqString, 
    guildID: reqString, 
    inventory: []
}, 
{
    timeStamps: true
}
)

module.exports = mongoose.model('Inventory', inventorySchema)