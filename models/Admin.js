const mongoose = require('mongoose');

const AdminSchema = mongoose.Schema({
	email: { type: String, required: true, index: { unique: true } },
	password: String,
	phoneNumber: Number,
	fullName: String,
	address: String,
	createdAt: Date,
	updatedAt: Date,
	addedBy: String,
});

module.exports = mongoose.model('Admin', AdminSchema);