/** @format */

const express = require('express');
const app = express();
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.post('/signup', async (req, res, next) => {
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

	admin.save().then((result) => {
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

app.post('/login', (req, res, next) => { 
	Admin.findOne({ email: req.body.email })
		.then(async (document) => {

		var passwordHash = document.password;
		console.log(passwordHash);
		var isMatch = await bcrypt.compare(req.body.password, passwordHash);
		if (isMatch){
			res.json({
				message: 'can LOG IN.',
				document: document,
			});			
		}
		else {
			res.json({
				message: "wrong Password.",
				document: null
			})
		}
	})
	.catch(err => {
		console.error(err);
	})
})

app.post('/update', async(req, res, next) => {
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
		.then((result) => {
			res.status(201).json({
				message: 'admin is updated.',
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
	Admin.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'Admin Details fetched successfully.',
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

app.delete('/:email', (req, res, next) => {
	var filter = { email: req.params.email };
	Admin.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'Admin is deleted.',
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

module.exports = app;
