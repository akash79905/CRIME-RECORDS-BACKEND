/** @format */

const express = require('express');
const app = express();
const Register = require('../models/Register');
const RequestIp = require('@supercharge/request-ip');
const IP = require('../models/IP');

app.post('/add', (req, res, next) => {
    const register = new Register({
        register_id: req.body.register_id,
        name: req.body.name,
        description: req.body.description,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	register.save().then(async (result) => {

		await addIP(req, 'Register Added');

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
		.then(async (result) => {

			await addIP(req, 'Register Updated');

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
		.then(async (documents) => {

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
		.then(async (document) => {

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
		.then(async (document) => {

			await addIP(req, 'Register Deleted');

			res.status(200).json({
				message: 'Register is deleted.',
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).json({
				message: 'error has occured.',
				documents: null,
			});
		});
});

async function addIP(req, message) {
	const ip = RequestIp.getClientIp(req);
	var ipEntry = new IP({
		ip: ip,
		executedBy: req.user.tokenkey,
		message: message,
		time: new Date(),
	});

	if (req.user.code !== null) {
		ipEntry['extraInfo'] = req.user.code;
	}
	await ipEntry.save();
}

module.exports = app;
