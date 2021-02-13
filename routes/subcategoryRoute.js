/** @format */

const express = require('express');
const app = express();
const SubCategory = require('../models/SubCategory');

app.post('/add', (req, res, next) => {
	const subcategory = new SubCategory({
        subcategory_id: req.body.subcategory_id,
        subcategory_of: req.body.subcategory_of,
		name: req.body.name,
		active_flag: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	subcategory
		.save()
		.then((result) => {
			res.status(201).json({
				documents: result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				message: 'error has occured.',
				documents: null,
			});
		});
});

app.post('/update', (req, res, next) => {
	const filter = { category_id: req.body.category_id };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
            name: req.body.name,
            subcategory_of: req.body.subcategory_of,
			active_flag: req.body.active_flag,
			updatedAt: new Date(),
		},
	};

	SubCategory.updateOne(filter, updatedDoc, options)
		.then((result) => {
			res.status(201).json({
				documents: result,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				message: 'error has occured.',
				documents: null,
			});
		});
});

app.get('/', (req, res, next) => {
	SubCategory.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				documents: documents,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				message: 'error has occured.',
				documents: null,
			});
		});
});

app.get('/:subcategory_id', (req, res, next) => {
	var filter = { subcategory_id: req.params.subcategory_id };
	SubCategory.findOne(filter)
		.then((document) => {
			res.status(200).json({
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				documents: null,
			});
		});
});

app.get('/:subcategory_of/:subcategory_id', (req, res, next) => {
	var filter = { subcategory_id: req.params.subcategory_id, subcategory_of: req.params.subcategory_of };
	SubCategory.findOne(filter)
		.then((document) => {
			res.status(200).json({
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				documents: null,
			});
		});
});


app.delete('/:subcategory_id', (req, res, next) => {
	var filter = { subcategory_id: req.params.subcategory_id };
	SubCategory.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
				documents: null,
			});
		});
});

module.exports = app;
    