const mongoose = require('mongoose');

const DepartmentSchema = mongoose.Schema({
	name: { type: String, required: true, index: { unique: true } },
	departmentType: String,
	departmentHeadName: String,
	path: { type: String, required: true },
	email: String,
	password: String,
	phoneNumber: Number,
	address: String,
	createdAt: Date,
	updatedAt: Date,
	addedBy: String,
}) 

module.exports = mongoose.model('Department', DepartmentSchema);
