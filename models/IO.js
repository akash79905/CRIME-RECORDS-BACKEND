/** @format */

const mongoose = require('mongoose');

const IOSchema = mongoose.Schema({
	code: { type: String, required: true, index: { unique: true } },
	password: String,
    phoneNumber: { type: Number, required: true },
	fullName: String,
	address: String,
	createdAt: Date,
	updatedAt: Date,
	addedBy: String,
});

module.exports = mongoose.model('IO', IOSchema);
