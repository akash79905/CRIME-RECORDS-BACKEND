/** @format */

const express = require('express');
const app = express();
const IO = require('../models/IO');
const IP = require('../models/IP');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const RequestIp = require('@supercharge/request-ip');
const Order = require('../models/Order');

app.post('/signup', async (req, res, next) => {
	IO.findOne({ code: req.body.code, phoneNumber: req.body.phoneNumber }).then(
		async (document) => {
			if (document != null) {
				res.status(400).json({
					documents: null,
					message: 'IO already exist',
				});
			}
		},
	);

	const IOEntry = new IO({
		code: req.body.code,
		password: await bcrypt.hash(req.body.password, saltRounds),
		phoneNumber: req.body.phoneNumber,
		fullName: req.body.fullName,
		address: req.body.address,
		createdAt: new Date(),
		updatedAt: new Date(),
		addedBy: req.body.addedBy,
	});

	const order = new Order({
		parent: req.body.code,
		child: req.body.phoneNumber,
		name: req.body.fullName,
	});

	await order.save();

	IOEntry.save()
		.then(async(result) => {

			req.user = { tokenkey: result.phoneNumber, code: result.code };
			await addIP(req, 'IO Signed UP'); 

			jwt.sign(
				{ code: req.body.code, tokenkey: req.body.phoneNumber },
				process.env.SECRET_KEY,
				(err, token) => {
					if (err) res.sendStatus(403);
					else {
						res.status(200).json({
							message: 'IO entry is added.',
							documents: result,
							token,
						});
					}
				},
			);
		})
		.catch((err) => {
			console.error(err);
			res.status(400).json({
				message: 'error has occured.',
				documents: null,
			});
		});
});

app.post('/login', (req, res, next) => {
	IO.findOne({ code: req.body.code, phoneNumber: req.body.phoneNumber })
		.then(async (document) => {
			if (document == null) {
				res.status(400).json({
					documents: null,
					message: "IO Doesn't exist",
				});
			} else {

				var passwordHash = document.password;
				
				var isMatch = await bcrypt.compare(req.body.password, passwordHash);
				
				if (isMatch) {

					req.user = { tokenkey: document.phoneNumber, code: document.code };
					await addIP(req, 'IO Logged IN'); 

					jwt.sign({code: req.body.code,tokenkey: req.body.phoneNumber}, process.env.SECRET_KEY,(err, token) => {
							if (err) res.sendStatus(403);
							res.status(200).json({
								message: 'can LOG IN.',
								document: document,
								token,
							});
						},
					);
				} else {
					res.status(400).json({
						message: 'wrong Password.',
						document: null,
					});
				}
			}
		})
		.catch((err) => {
			console.error(err);
		});
});

app.post('/update/:phoneNumber', verifyToken, async (req, res, next) => {
	const filter = { code: req.body.code, phoneNumber: req.params.phoneNumber };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
			phoneNumber: req.body.phoneNumber,
			password: await bcrypt.hash(req.body.password, saltRounds),
			fullName: req.body.fullName,
			address: req.body.address,
			updatedAt: new Date(),
		},
	};

	IO.updateOne(filter, updatedDoc, options)
		.then(async(result) => {

			await addIP(req, 'IO Updated');

			res.status(200).json({
				message: 'IO is updated.',
				documents: result,
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

app.get('/', verifyToken, (req, res, next) => {
	IO.find()
		.sort('-updatedAt')
		.then(async(documents) => {

			await addIP(req, 'Get All IO Details');

			res.status(200).json({
				message: 'IO Details fetched successfully.',
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

app.get('/:phoneNumber', verifyToken, (req, res, next) => {
	var filter = { phoneNumber: req.params.phoneNumber };
	IO.findOne(filter)
		.then(async(document) => {

			await addIP(req, 'Get IO Entry');

			res.status(200).json({
				message: 'IO entry is fetched.',
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

app.delete('/:phoneNumber', verifyToken, (req, res, next) => {
	var filter = { phoneNumber: req.params.phoneNumber };
	IO.deleteOne(filter)
		.then(async(document) => {

			await addIP(req, 'IO Deleted');

			res.status(200).json({
				message: 'IO entry is deleted.',
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

function verifyToken(req, res, next) {
	const bearerHeader = req.headers['authorization'];

	if (typeof bearerHeader !== 'undefined') {
		const bearer = bearerHeader.split(' ');

		const bearerToken = bearer[1];

		req.token = bearerToken;

		jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
			if (err) res.sendStatus(403);
			
			req.user = authData;
			next();
		});
	} else {
		res.sendStatus(403);
	}
}

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
