var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
// var timestamps = require('mongoose-timestamp');
const bcrypt = require('bcrypt')
const saltRounds = 10;


var userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String
    // unique: true
  },
  phone: String,
  password: String,
  gender: String,
  location: String,
  website: String,
  picture: String,
  facebook: String,
  twitter: String,
  google: String,
  github: String,
  vk: String,
  tokenBalance: Number,
  admin: { type: Boolean, default: false },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  status: {
    type: String,
    default: 'ACTIVE',
    enum: ['PENDING-ACTIVATION', 'ACTIVE', 'INACTIVE', 'DELETED']
  }
});

userSchema.pre('save', function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.plugin(timestamps);
module.exports = mongoose.model('user', userSchema);