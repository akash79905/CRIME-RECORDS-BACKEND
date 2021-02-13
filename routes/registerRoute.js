/** @format */

const express = require('express');
const app = express();
const Register = require('../models/Register');

app.post('/add', (req, res, next) => {
    const register = new Register({
        register_id: req.body.register_id,
        name: req.body.name,
        description: req.body.description,
		createdAt: new Date(),
		updatedAt: new Date(),
	});


	register.save().then((result) => {
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
	const filter = { register_id: req.body.register_id };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
			name: req.body.name,
			description: req.body.description,
			updatedAt: new Date(),
		},
	};

	Register.updateOne(filter, updatedDoc, options)
		.then((result) => {
			res.status(201).json({
				message: 'register is updated.',
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
	Register.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'register Details fetched successfully.',
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

app.get('/:register_id', (req, res, next) => {
	var filter = { register_id: req.params.register_id };
	Register.findOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'register is fetched.',
				documents: document,
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


app.delete('/:register_id', (req, res, next) => {
	var filter = { register_id: req.params.register_id };
	Register.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'Register is deleted.',
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.json({
                message: 'error has occured.',
                documents: null
			});
		});
});

module.exports = app;
