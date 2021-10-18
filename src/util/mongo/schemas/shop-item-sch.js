const mongoose = require('mongoose');

const shopItemSchema = mongoose.Schema(
  {
    guildID: {
      type: String,
      required: true,
  ***REMOVED***
    name: { type: String, required: true },
    price: { type: Number, required: true },
    deactivated: { type: Boolean, required: false },
    description: { type: String, required: false },
    expiresOnTimestamp: { type: Number, required: false }, // when the item will be de-activated in the shop
    duration: { type: Number, required: false }, // temp value that gets translated to expiresOnTimestamp
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
      required: true,
      // options: typeGenerator (null/und = basic)
  ***REMOVED***
    data: {
      typeGenerator: {
        generatorPeriod: { type: Number, required: false }, // interval after which the owner of the generator receives income
        generatorIncomeAmount: { type: Number, required: false },
        isIncomeDeposited: { type: Boolean, required: false }, // deposit the income to bank (true) or keep it as cash (false)
    ***REMOVED***
  ***REMOVED***
***REMOVED***
  {
    timestamps: true,
    versionKey: false,
  }
);

/* 
  middleware validation check
  we are intercepting the new schema before it is sent to db
  and recursively trimming off several falsy values (the defaults can be found in util)
  from iterated object properties using the trimObj. function I created.
  in 'pre' middleware, this refers to the schema object.
*/
shopItemSchema.pre('save', function (next) {
  let item = this;
  if (this.duration) {
    this.expiresOnTimestamp = Date.now() + this.duration;
    delete this.duration;
  }

  let trimmedRequirements = {}

  if (Object.keys(this.requirements).length) {
    if (this.requirements.requiredRolesArray && this.requirements.requiredRolesArray?.length) {
      trimmedRequirements['requiredRolesArray'] = this.requirements.requiredRolesArray
    }
    if (this.requirements.requiredInventoryItemsArray && this.requirements.requiredInventoryItemsArray?.length) {
      trimmedRequirements['requiredInventoryItemsArray'] = this.requirements.requiredInventoryItemsArray
    }

    if (this.rolesGivenArray && !this.rolesGivenArray?.length) {
      this.rolesGivenArray = undefined
    }
    if (this.rolesRemovedArray && !this.rolesRemovedArray?.length) {
      this.rolesRemovedArray = undefined
    }
  }

  this.requirements = trimmedRequirements

  console.log('shopItemSchema.pre:', this)

  next();
});

module.exports = mongoose.model('shop', shopItemSchema);
