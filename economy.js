const mongo = require('./mongo')
const economyBalSchema = require('./schemas/economy-sch')

// memory (faster than database) - we store values here once we get them from db
const balanceCache = {} // syntax: String (guildID-userID) : Number (balance)

module.exports = (client) => {}

module.exports.addBal = async (guildID, userID, balance) => {
     return await mongo().then(async (mongoose) => {
          try {
               // console.log('findOneAndUpdate() running')

               const result = await economyBalSchema.findOneAndUpdate({
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

               // console.log('RESULT BAL:', result.balance)

               balanceCache[`${guildID}-${userID}`] = result.balance

               return result.balance
          } finally {
               mongoose.connection.close()
          }
     })
}

module.exports.getBal = async (guildID, userID) => {
     const cached = balanceCache[`${guildID}-${userID}`] + 1
     if ( cached ) {
          console.log(balanceCache)
          return cached - 1
     }
     return await mongo().then(async (mongoose) => {
          try {
               console.log('findOne() running')

               const result = await economyBalSchema.findOne({
                    guildID,
                    userID,
               })

               // console.log('Result: ', result)

               let balance = 0
               if (result) {
                    balance = result.balance
               } else {
                    console.log('creating new schema')

                    await new economyBalSchema({
                         guildID,
                         userID,
                         balance
                    }).save()
               }

               balanceCache[`${guildID}-${userID}`] = balance

               return balance
          } finally {
               mongoose.connection.close()

          }
     })
}