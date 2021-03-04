/** @format */

const express = require('express');
const app = express();
const Admin = require('../models/Admin');
const IP = require('../models/IP');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const RequestIp = require('@supercharge/request-ip');


app.post('/signup', async (req, res, next) => {
	Admin.findOne({ email: req.body.email }).then(async (document) => {
		if (document != null) {
			res.status(400).json({
				documents: null,
				message: 'Admin already exist',
			});
		}
	});

	const admin = new Admin({
		email: req.body.email,
		password: await bcrypt.hash(req.body.password, saltRounds),
		phoneNumber: req.body.phoneNumber,
		fullName: req.body.fullName,
		address: req.body.address,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	if (req.body.addedBy) {
		admin['addedBy'] = req.body.addedBy;
	}

	admin
		.save()
		.then(async(result) => {

			req.user = { tokenkey: result.email };
			await addIP(req, 'Admin Signed UP'); 

			jwt.sign({ tokenkey: result.email }, process.env.SECRET_KEY, (err, token) => {	
				if (err) res.sendStatus(403);
				res.status(200).json({
					documents: result,
					token
				});
			})
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
	Admin.findOne({ email: req.body.email })
		.then(async (document) => {
			if (document == null) {
				res.status(400).json({
					documents: null,
					message: "Admin Doesn't exist",
				});
			}

			var passwordHash = document.password;

			var isMatch = await bcrypt.compare(req.body.password, passwordHash);
			if (isMatch) {

				req.user = { tokenkey: document.email };
				await addIP(req, 'Admin Logged IN');

				jwt.sign({ tokenkey: document.email }, process.env.SECRET_KEY, (err, token) => {
					if (err) res.sendStatus(403);
					res.status(200).json({
						message: 'can LOG IN.',
						document: document,
						token,
					});
				});
			} else {
				res.status(400).json({
					message: 'wrong Password.',
					document: null,
				});
			}
		})
		.catch((err) => {
			console.error(err);
		});
});

app.post('/update', verifyToken, async(req, res, next) => {
	const filter = { email: req.body.email };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
			password: await bcrypt.hash(req.body.password, saltRounds),
			phoneNumber: req.body.phoneNumber,
			fullName: req.body.fullName,
			address: req.body.address,
			updatedAt: new Date(),
		},
	};

	Admin.updateOne(filter, updatedDoc, options)
		.then(async(result) => {

			await addIP(req, 'Admin Updated');

			res.status(200).json({
				message: 'admin is updated.',
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

app.get('/', verifyToken,(req, res, next) => {
	Admin.find()
		.sort('-updatedAt')
		.then(async(documents) => {
			
			await addIP(req, 'Get All Admins Details');

			res.status(200).json({
				message: 'Admin Details fetched successfully.',
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

app.get('/:email', verifyToken, (req, res, next) => {
	var filter = { email: req.params.email };
	Admin.findOne(filter)
		.then(async (document) => {

			await addIP(req, 'Get Admin Entry');

			res.status(200).json({
				message: 'Admin is fetched.',
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


app.delete('/:email', verifyToken, (req, res, next) => {
	var filter = { email: req.params.email };
	Admin.deleteOne(filter)
		.then(async (document) => {
			
			await addIP(req, 'Admin Deleted');

			res.status(200).json({
				message: 'Admin is deleted.',
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
		time: new Date()
	});

	if (req.user.code !== null) {
		ipEntry['extraInfo'] = req.user.code;
	}
	await ipEntry.save();
}

module.exports = app;
