var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp2');
var peopleSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dob: Date,
  phone: String,
  physicalAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String
  },
  mailingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zipcode: String
  },
  email: {
    type: String
  },
  gender: String,
  location: String,
  website: String,
  picture: String,
  facebook: String,
  twitter: String,
  google: String,
  linkedin: String,
  status:  {type:String , enum:['ACTIVE','DEACTIVE']},

  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    note: String,
    createdOn: Date
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
});
peopleSchema.plugin(timestamps);
module.exports = mongoose.model('people', peopleSchema);