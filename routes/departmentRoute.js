/** @format */

const express = require('express');
const app = express();
const Department = require('../models/Department');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const IP = require('../models/IP');
const RequestIp = require('@supercharge/request-ip');
const Order = require('../models/Order');

app.post('/signup', async (req, res, next) => {
	try {
		Department.findOne({ name: req.body.name }).then(async (document) => {
			if (document != null) {
				res.status(400).json({
					documents: null,
					message: 'IO already exist',
				});
			}
		});

		var department = new Department({
			name: req.body.name,
			departmentType: req.body.departmentType,
			departmentHeadName: req.body.departmentHeadName,
			email: req.body.email,
			password: await bcrypt.hash(req.body.password, saltRounds),
			phoneNumber: req.body.phoneNumber,
			fullName: req.body.fullName,
			address: req.body.address,
			createdAt: new Date(),
			updatedAt: new Date(),
			addedBy: req.body.addedBy,
		});

		if (req.body.subDepartmentOf) {
			const doc = await Department.findOne({ name: req.body.subDepartmentOf });
			var path = doc.path;
			path = path + '/' + req.body.name;
			department.path = path;

			const order = new Order({
				parent: req.body.subDepartmentOf,
				child: req.body.name,
				name: req.body.departmentHeadName
			});

			await order.save();

		} else {
			department['path'] = req.body.name;
		}

		const dep = await department.save();

		req.user = { tokenkey: dep.name };
		await addIP(req, 'Department Signed UP'); 

		jwt.sign({ tokenkey: dep.name }, process.env.SECRET_KEY, (err, token) => {
			if (err) res.sendStatus(403);
			res.status(200).json({
				message: 'department added.',
				documents: dep,
				token,
			});
		});
		
		
	} catch (err) {
		console.log(err);
	}
});

app.post('/login',async (req, res, next) => {
	Department.findOne({ name: req.body.name })
		.then(async (document) => {
			if (document === null) {
				res.status(400).json({
					documents: null,
					message: "Department Doesn't exist",
				});
			}

			var passwordHash = document.password;
			
			var isMatch = await bcrypt.compare(req.body.password, passwordHash);
			if (isMatch) {

				req.user = { tokenkey: document.name };
				await addIP(req, 'Department Logged IN'); 

				jwt.sign({ tokenkey: document.name }, process.env.SECRET_KEY, (err, token) => {
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

app.post('/update', verifyToken,async (req, res, next) => {
	const filter = { name: req.body.name };
	const options = { upsert: true };

	const updatedDoc = req.body;
	updatedDoc['password'] = await bcrypt.hash(req.body.password, saltRounds),
		/*= {
		$set: {
			departmentHeadName: req.body.departmentHeadName,
			password: await bcrypt.hash(req.body.password, saltRounds),
			email: req.body.email,
			phoneNumber: req.body.phoneNumber,
			fullName: req.body.fullName,
			address: req.body.address,
			updatedAt: new Date(),
		},
	};
*/
		Department.updateOne(filter, updatedDoc, options)
			.then(async (result) => {
				await addIP(req, 'Department Updated');

				res.status(200).json({
					message: 'department is updated.',
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
	Department.find()
		.sort('-updatedAt')
		.then(async(documents) => {

			await addIP(req, 'Get All Departments Details');

			res.status(200).json({
				message: 'All Departments Details fetched successfully.',
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

app.get('/:name', verifyToken, (req, res, next) => {
	Department.findOne({ name: req.params.name })
		.then(async(document) => {

			await addIP(req, 'Get Department Entry');

			res.status(200).json({
				message: 'Department Details fetched successfully.',
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


app.get('/level/:type', verifyToken, (req, res, next) => {
	Department.findOne({ departmentType: req.params.type })
		.then(async(document) => {

			await addIP(req, 'Get Departments Entry');

			res.status(200).json({
				message: 'Department Details fetched successfully.',
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


app.get('/addedby/:addedBy', verifyToken, (req, res, next) => {
	Department.findOne({ addedBy: req.params.addedBy })
		.then(async(document) => {

			await addIP(req, 'Get Department Entry');

			res.status(200).json({
				message: 'Department Details fetched successfully.',
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

app.delete('/:name', verifyToken, (req, res, next) => {
	var filter = { name: req.params.name };
	Department.deleteOne(filter)
		.then(async (document) => {

			await addIP(req, 'Department Deleted');

			res.status(200).json({
				message: 'Department is deleted.',
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
