/** @format */

const mongoose = require('mongoose');

const RegisterSchema = mongoose.Schema({
    register_id: { type: String, required: true },
	name: String,
	description: String,
	createdAt: Date,
	updatedAt: Date,
});

module.exports = mongoose.model('Register', RegisterSchema);
