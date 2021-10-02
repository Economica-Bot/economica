const mongoose = require('mongoose');

const shopItemSchema = mongoose.Schema({
  _id: { type: String, required: true },
  guildID: {
    type: String,
    required: true,
***REMOVED***
  createdOnTimestamp: { type: Number, required: false }, // when the item was created
  lastEditedOnTimestamp: { type: Number, required: false }, // last editeed time
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  expiresOnTimestamp: { type: Number, required: false }, // when the item will be de-activated in the shop
  stockLeft: { type: Number, required: false }, // how many instances of the item can be purchased before it is de-activated in the shop
  isInventoryItem: { type: Boolean, required: false },
  rolesGivenArray: { type: Array, required: false },
  rolesRemovedArray: { type: Array, required: false },
  requirements: {
    requiredRolesArray: { type: Array, required: false },
    // isEveryRoleRequired: { type: Boolean, required: false }, // when true, buyer must have all required roles to purchase. When false, buyer must have at least one required role to purchase.
    requiredInventoryItemsArray: { type: Array, required: false },
    requiredBalance: { type: Number, required: false },
***REMOVED***
  type: {
    type: String,
    // options: typeGenerator (null/und = basic)
***REMOVED***
  data: {
    typeGenerator: {
      generatorPeriod: { type: Number, required: false }, // interval after which the owner of the generator receives income
      generatorIncomeAmount: { type: Number, required: false },
      isIncomeDeposited: { type: Boolean, required: false }, // deposit the income to bank (true) or keep it as cash (false)
  ***REMOVED***
***REMOVED***
  special: {
    changeNick: { type: Boolean, required: false }, // purchaser can change their nickname regardless of permissions
    gift: {
      giftMoneyAmount: { type: Number, required: false },
      giftItemsContentArray: { type: Array, required: false }, // items in the gift
      giftClaimExpiration: { type: Date, required: false }, // how long until the gift can no longer be claimed
  ***REMOVED***
    incomeMultiplier: {
      multiplier: { type: Number, required: false },
      multiplierExpiration: { type: Date, required: false },
  ***REMOVED***
    changeNameColor: {
      anyColor: { type: Boolean, required: false }, // can the purchaser decide the color?
      colorRoleHex: { type: String, required: false }, // the specific color hex if the purchaser cannot decide the color
      colorRoleExpiration: { type: Date, required: false },
  ***REMOVED***
***REMOVED***
  amountGiven: { type: Number, required: true, default: 1 },
});

/* 
  middleware validation check
  we are intercepting the new schema before it is sent to db
  and recursively trimming off several falsy values (the defaults can be found in util)
  from iterated object properties using the trimObj. function I created.
  in 'pre' middleware, this refers to the schema object.
*/
shopItemSchema.pre('save', function (next) {
  let item = this

  console.log(item)

  next();
})

module.exports = mongoose.model('shop', shopItemSchema);
