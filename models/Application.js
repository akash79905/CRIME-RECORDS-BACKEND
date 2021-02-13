const mongoose = require('mongoose');

const ApplicationSchema = mongoose.Schema({
	application_id: { type: String, required: true, index: { unique: true } },
	register_id: { type: String, required: true },
	application_date: Date,
	application_content: String,
	applicant_name: String,
	applicant_address: String,
	applicant_phone_number: Number,
	opponent_name: String,
	opponent_address: String,
	opponent_phone_number: String,
	application_category: String,
	application_subcategory: String,
	application_status: String,
	document: String,
	added_by: String,
	at_stage: String,
	createdAt: Date,
	updatedAt: Date,
	IMEI_NO: String,
	active_flag: Boolean,
	ioName: String,
	ioPhoneNumber: Number,
	path: String
});

module.exports = mongoose.model('Application', ApplicationSchema);