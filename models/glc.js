var mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');

var glcSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    status: {
        type: String,
        enum: ["New", "Pending", "In-Review", "Completed"],
        default: "Pending",

    },  
    password: {
        type: String,
        default: "background"
    },
    remark: { type: String },
    docs: [{
        name: String,
        file: String
    }],
    createdAt: {
        type: Date,
        default: new Date()
    }
})

// autoIncrement.initialize(mongoose.connection);
// glcSchema.plugin(autoIncrement.plugin, {
//     model: 'glc', field: 'referenceNo', startAt: 100,
//     incrementBy: 1
// });
module.exports = mongoose.model('glc', glcSchema);
