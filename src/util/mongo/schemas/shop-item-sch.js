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
    duration: { type: Number, required: false },
    stackable: { type: Boolean, required: true },
    stock: { type: Number, required: false },
    rolesGiven: { type: Array, required: true },
    rolesRemoved: { type: Array, required: true },
    requiredRoles: { type: Array, required: true },
    requiredItems: { type: Array, required: true },
    requiredBank: { type: Number, required: false },
    generatorPeriod: { type: Number, required: false }, // generator intervals
    generatorAmount: { type: Number, required: false },
***REMOVED***
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('shop_item', shopItemSchema);
