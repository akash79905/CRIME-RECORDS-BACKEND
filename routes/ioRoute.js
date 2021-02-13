/** @format */

const express = require('express');
const app = express();
const IO = require('../models/IO');
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.post('/signup', async(req, res, next) => {
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

	IOEntry.save().then((result) => {
		res.status(201).json({
			message: 'IO entry is added.',
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


app.post('/login', (req, res, next) => { 
	IO.findOne({ code: req.body.code, phoneNumber: req.params.phoneNumber })
	.then(async(document) => {
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

app.post('/update/:phoneNumber', async(req, res, next) => {
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
		.then((result) => {
			res.status(201).json({
				message: 'IO is updated.',
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
	IO.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'IO Details fetched successfully.',
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

app.get('/:phoneNumber', (req, res, next) => {
	var filter = { phoneNumber: req.params.phoneNumber };
	IO.findOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'IO entry is fetched.',
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


app.delete('/:phoneNumber', (req, res, next) => {
	var filter = { phoneNumber: req.params.phoneNumber };
	IO.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'IO entry is deleted.',
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
