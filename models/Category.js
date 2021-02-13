const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
	category_id: { type: String, required: true },
	name: { type: String, required: true },
	active_flag: Boolean,
	createdAt: Date,
	updatedAt: Date,
});

module.exports = mongoose.model('Category', CategorySchema);
