/** @format */

const mongoose = require('mongoose');

const IOSchema = mongoose.Schema({
	code: String,
	password: String,
    phoneNumber: { type: Number, required: true , index: { unique: true }},
	fullName: String,
	address: String,
	createdAt: Date,
	updatedAt: Date,
	addedBy: String,
});

module.exports = mongoose.model('IO', IOSchema);
