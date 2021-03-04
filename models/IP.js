const mongoose = require('mongoose');

const IPSchema = mongoose.Schema({
    ip : String,
    executedBy: String,
    executedOnWhat: String,
    extraInfo: String,
    message: String,
    time: Date
});

module.exports = mongoose.model('IP', IPSchema);
