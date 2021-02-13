/** @format */

const express = require('express');
const app = express();
const Category = require('../models/Category');

app.post('/add', (req, res, next) => {
    const category = new Category({
        category_id: req.body.category_id,
        name: req.body.name,
        active_flag: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});


	category.save().then((result) => {
		res.status(201).json({
			documents: result,
		});
    })
    .catch((err) => {
        console.error(err);
        res.json({
            message: 'error has occured.',
            documents: null
        })
    });    
});

app.post('/update', (req, res, next) => {
	const filter = { category_id: req.body.category_id };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
			name: req.body.name,
            active_flag: req.body.active_flag,
			updatedAt: new Date(),
		},
	};

	Category.updateOne(filter, updatedDoc, options)
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
	Category.find()
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

app.get('/:category_id', (req, res, next) => {
	var filter = { category_id: req.params.category_id };
	Category.findOne(filter)
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


app.delete('/:category_id', (req, res, next) => {
	var filter = { category_id: req.params.category_id };
	Category.deleteOne(filter)
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
