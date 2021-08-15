const mongoose = require('mongoose');

const reqString = {
  type: String,
  required: true,
};

const reqNumber = {
  type: Number,
  required: true,
};

const reqBoolean = {
  type: Boolean, 
  required: true
}

const loanSchema = mongoose.Schema(
  {
    guildID: reqString,
    borrowerID: reqString,
    lenderID: reqString,
    principal: reqNumber,
    repayment: reqNumber,
    expires: {
      type: Date,
      required: true,
  ***REMOVED***
    pending: reqBoolean,
    active: reqBoolean,
    complete: reqBoolean
***REMOVED***
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('loans', loanSchema);
