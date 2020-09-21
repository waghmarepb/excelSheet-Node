var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var timestamps = require('mongoose-timestamp2');
var tempDocs = new mongoose.Schema({
    file: String,
    name: String,
    status: {type:String, enum:["used", "un-used"], default:"used"}
})
tempDocs.plugin(timestamps);
module.exports = mongoose.model('doc', tempDocs);