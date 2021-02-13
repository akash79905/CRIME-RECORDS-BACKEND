/** @format */

const express = require('express');
const app = express();
const Application = require('../models/Application');
const Department = require('../models/Department');

app.post('/add', async(req, res, next) => {
	var document = req.body;
	document['updatedAt'] = new Date();
	document['createdAt'] = new Date();
	document['at_stage'] = req.body.added_by;
	var application = new Application(document);

	const doc = await Department.findOne({ name: req.body.added_by });
	application['path'] = doc.path;

	application
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

app.post('/update/:application_id', (req, res, next) => {
	const filter = { application_id: req.params.application_id };
	const options = { upsert: true };

	var updatedDoc = req.body;
	updatedDoc['updatedAt'] = new Date();

	Application.replaceOne(filter, updatedDoc, options)
		.then((result) => {
			res.status(201).json({
				message: 'application is updated.',
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

app.post('/sendto/:name/:application_id', (req, res, next) => {
	const filter = { application_id: req.params.application_id };
	const options = { upsert: true };

	var updatedDoc = req.body;
	updatedDoc['updatedAt'] = new Date();
	updatedDoc['at_stage'] = req.params.name;
	var path = updatedDoc['path'] + '/' + req.params.name;
	updatedDoc['path'] = path;

	Application.replaceOne(filter, updatedDoc, options)
		.then((result) => {
			res.status(201).json({
				message: 'application is updated.',
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

app.post('/assignIO/:application_id', (req, res, next) => {
	const filter = { application_id: req.params.application_id };
	const options = { upsert: true };

	var updatedDoc = req.body;
	updatedDoc['updatedAt'] = new Date();

	Application.replaceOne(filter, updatedDoc, options)
		.then((result) => {
			res.status(201).json({
				message: 'application is updated.',
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
	Application.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/:application_id', (req, res, next) => {
	Application.find({ application_id: req.params.application_id })
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.get('/io/:ioPhoneNumber', (req, res, next) => {
	Application.find({ ioPhoneNumber: req.params.ioPhoneNumber })
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/department/:name', (req, res, next) => {
	Application.find({ path: { "$regex": ".*"+ req.params.name +".*"} })
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/pending/:month', (req, res, next) => {
	Application.find({
		application_status: 'પેન્ડિંગ',
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
	})
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/io/pending/:ioPhoneNumber/:month', (req, res, next) => {
	Application.find({
		application_status: 'પેન્ડિંગ',
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
		ioPhoneNumber: req.params.ioPhoneNumber
	})
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.get('/department/pending/:name/:month', (req, res, next) => {
	Application.find({
		application_status: 'પેન્ડિંગ',
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
		path: { $regex: '.*' + req.params.name + '.*' }
	})
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.delete('/:_id', (req, res, next) => {
	var filter = { _id: req.params._id };
	Application.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'Application is deleted.',
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