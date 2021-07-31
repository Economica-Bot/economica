const mongoose = require('mongoose')

const num = {
     type: Number,
     required: false
}

const reqString = {
    type: String, 
    required: true
}

const incomeSchema = mongoose.Schema({
     guildID: reqString,
     work: {
          min: num,
          max: num,
          cooldown: num
   ***REMOVED***
     beg: {
          min: num,
          max: num,
          cooldown: num,
          chance: num
   ***REMOVED***
     crime: {
          min: num,
          max: num,
          cooldown: num,
          chance: num,
          minFine: num,
          maxFine: num
   ***REMOVED***
     rob: {
          cooldown: num,
          chance: num,
          minFine: num,
          maxFine: num
    ***REMOVED***
      coinflip: {
          cooldown: num, 
          chance: num
    ***REMOVED*** 
      craps: {
          min: num,
          max: num,
          cooldown: num,
      }
})

module.exports = mongoose.model('Income', incomeSchema)