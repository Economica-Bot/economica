const mongoose = require('mongoose');

// required only if parent field exists
const trueif = (parent) => this[parent] ? true : false

const marketItemSchema = mongoose.Schema({
  guildID: {
    type: String,
    required: true,
***REMOVED***
  userID: { type: String, required: true },
  createdOnTimestamp: { type: Date, required: true }, // when the item was created
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  expiresOnTimestamp: { type: Date, required: false }, // when the item will be de-activated in the shop
  stockLeft: { type: Number, required: false }, // how many instances of the item can be purchased before it is de-activated in the shop
  requirements: {
    requiredRolesArray: { type: Array, required: false },
    // isEveryRoleRequired: { type: Boolean, required: false }, // when true, buyer must have all required roles to purchase. When false, buyer must have at least one required role to purchase.
    requiredInventoryItemsArray: { type: Array, required: false },
    requiredBalance: { type: Number, required: false },
***REMOVED***
  type: {
    type: String,
    required: true,
    // options: Role, Generator, Inventory
***REMOVED***
  data: {
    typeRole: {
      rolesGivenArray: { type: Array, required: false },
      rolesRemovedArray: { type: Array, required: false },
      roleTemporaryExpirationTime: { type: Number, required: false }, // how long until the role(s) should be removed from the purchaser
  ***REMOVED***
    typeGenerator: {
      generatorPeriod: { type: Number, required: trueif(typeGenerator) }, // interval after which the owner of the generator receives income
      generatorIncomeAmount: { type: Number, required: trueif(typeGenerator) },
      isIncomeDeposited: { type: Boolean, required: false }, // deposit the income to bank (true) or keep it as cash (false)
  ***REMOVED***
    typeInventory: {
      inventoryMaxQuantity: { type: Number, required: false }, // the maximum amount of this item one purchaser can have in their inventory
  ***REMOVED***
***REMOVED***
  special: {
    changeNick: { type: Boolean, required: false }, // purchaser can change their nickname regardless of permissions
    gift: {
      giftMoneyAmount: { type: Number, required: false },
      giftItemsContentArray: { type: Array, required: false }, // items in the gift
      giftClaimExpiration: { type: Date, required: trueif(gift) }, // how long until the gift can no longer be claimed
  ***REMOVED***
    incomeMultiplier: {
      multiplier: { type: Number, required: trueif(incomeMultiplier) },
      multiplierExpiration: { type: Date, required: trueif(incomeMultiplier) },
  ***REMOVED***
    changeNameColor: {
      anyColor: { type: Boolean, required: false }, // can the purchaser decide the color?
      colorRoleHex: { type: String, required: !trueif(anyColor) }, // the specific color hex if the purchaser cannot decide the color
      colorRoleExpiration: { type: Date, required: false },
  ***REMOVED***
***REMOVED***
  amount: {
    type: Number,
    required: false,
    // not to be set on shop-item creation, only on purchase (stack items in inventory)
***REMOVED***
});

module.exports = mongoose.model('shop', shopItemSchema)
