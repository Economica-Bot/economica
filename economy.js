const mongo = require('./mongo')
const economySchema = require('./schemas/economy-sch')

module.exports = (client) => {}

module.exports.addBal = async (guildID, userID, balance) => {
     return await mongo().then(async (mongoose) => {
          try {
               console.log('findOneAndUpdate() running')

               const result = await economySchema.findOneAndUpdate({
                    guildID,
                    userID,
               }, {
                    guildID,
                    userID,
                    $inc: {
                         balance
                    }
               }, {
                    upsert: true,
                    new: true
               })

               console.log('RESULT BAL:', result.balance)

               return result.balance
          } finally {
               mongoose.connection.close()
          }
     })
}

module.exports.getBal = async (guildID, userID) => {
     return await mongo().then(async (mongoose) => {
          try {
               console.log('findOne() running')

               const result = await economySchema.findOne({
                    guildID,
                    userID,
               })

               console.log('Result: ', result)

               let balance = 0
               if (result) {
                    balance = result.balance
               } else {
                    console.log('creating new schema')

                    await new economySchema({
                         guildID,
                         userID,
                         balance
                    }).save()
               }

               return balance
          } finally {
               mongoose.connection.close()

          }
     })
}