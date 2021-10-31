const mongoose = require('mongoose');

const shopItemSchema = mongoose.Schema(
  {
    guildID: {
      type: String,
      required: true,
  ***REMOVED***
    type: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    active: { type: Boolean, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    stackable: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    rolesGiven: { type: Array, required: true },
    rolesRemoved: { type: Array, required: true },
    requiredRoles: { type: Array, required: true },
    requiredItems: { type: Array, required: true },
    requiredBank: { type: Number, required: true },
    generatorPeriod: { type: Number, required: true }, // interval after which the owner of the generator receives income
    generatorAmount: { type: Number, required: true },
***REMOVED***
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('shop_item', shopItemSchema);
