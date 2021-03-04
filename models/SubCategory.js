const mongoose = require('mongoose');

const SubCategorySchema = mongoose.Schema({
	subcategory_of: { type: String, required: true },
	name: { type: String, required: true },
	active_flag: Boolean,
	createdAt: Date,
	updatedAt: Date,
});

module.exports = mongoose.model('SubCategory', SubCategorySchema);
