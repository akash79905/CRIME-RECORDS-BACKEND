/** @format */

const express = require('express');
const app = express();
const IP = require('../models/IP');

app.get('/', (req, res, next) => {
	IP.find()
		.sort('-time')
		.then(async (documents) => {
			res.status(200).json({
				message: 'IP Details fetched successfully.',
				documents: documents,
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

app.get('/message/:message', (req, res, next) => {

	IP.find({ message: req.params.message })
		.sort('-time')
		.then(async (documents) => {
			res.status(200).json({
				message: 'IP Details fetched successfully.',
				documents: documents,
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

app.get('/user/:executedBy', (req, res, next) => {
	IP.find({ executedBy: req.params.executedBy })
		.sort('-time')
		.then(async (documents) => {
			res.status(200).json({
				message: 'IP Details fetched successfully.',
				documents: documents,
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

module.exports = app;