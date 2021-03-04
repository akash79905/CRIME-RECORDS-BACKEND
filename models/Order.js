const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    parent: String,
	child: String,
	name: String
});

module.exports = mongoose.model('Order', OrderSchema);
