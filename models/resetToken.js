var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp2');

var resetTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  token: String,
  expiresOn: Date
});

resetTokenSchema.plugin(timestamps);
module.exports = mongoose.model('reset_token', resetTokenSchema);