const mongoose = require('mongoose')
const { mongoPath } = require('../config.json')

module.exports = async () => {
    const options = { 
        useUnifiedTopology: true,
        useNewUrlParser: true,  
        useFindAndModify: true, 
    }
    await mongoose.connect(mongoPath, options)
    return mongoose
}