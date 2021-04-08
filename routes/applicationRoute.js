const express = require('express');
const app = express();
const IP = require('../models/IP');
const Application = require('../models/Application');
const Department = require('../models/Department');
const RequestIp = require('@supercharge/request-ip');
const Order = require('../models/Order');
const Transfer = require('../models/Transfer')

app.post('/add', async (req, res, next) => {
	
	Application.findOne({ application_id: req.body.application_id }).then(async (document) => {
		if (document != null) {
			res.status(400).json({
				documents: null,
				message: 'Application ID is used'
			});
		}
	});


	var document = req.body;
	document['updatedAt'] = new Date();
	document['createdAt'] = new Date();
	document['added_by'] = req.user.tokenkey;
	document['at_stage'] = req.body.added_by;
	var application = new Application(document);

	const doc = await Department.findOne({ name:document.added_by });
	application['path'] = doc.path;

	application
		.save()
		.then(async(result) => {

			await addIP(req, "Application Added")

			res.status(200).json({
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

app.post('/update/:application_id', (req, res, next) => {
	const filter = { application_id: req.params.application_id };
	const options = { upsert: true };

	var updatedDoc = req.body;
	updatedDoc['updatedAt'] = new Date();

	Application.replaceOne(filter, updatedDoc, options)
		.then(async(result) => {

			await addIP(req, "Application Updated")

			res.status(200).json({
				message: 'application is updated.',
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

app.post('/transfer', (req, res, next) => {
	try {
		
		const filter = { application_id: req.body.application_id };
		const options = { upsert: true };

		var updatedDoc = req.body;
		updatedDoc['updatedAt'] = new Date();

		var transfer = new Transfer(updatedDoc);
		transfer.save().then((result) => {
		
			Application.deleteOne(filter)
				.then(async(result) => {
			
					if ('ioPhoneNumber' in req.body) {
						req.user.code = req.body.ioPhoneNumber;
					}
					else {
						req.user.code = req.body.at_stage;
					}
					await addIP(req, "Application Transfered");

					res.status(200).json({
						message: 'application is transfered.',
						documents: result
					});
				})
		})
	}
	catch(err){
			console.error(err);
			res.status(400).json({
				message: 'error has occured.',
				documents: null,
			});
	};
});

app.post('/accept', (req, res, next) => {
	try {
		
		const filter = { application_id: req.body.application_id };
		const options = { upsert: true };

		var updatedDoc = req.body;
		updatedDoc['updatedAt'] = new Date();

		var application = new Application(updatedDoc);
		application['at_stage'] = req.user.tokenkey;
			
		let new_path = application['path'] + "/" + req.user.tokenkey;
		application['path'] = new_path;

		application.save().then((result) => {
		
			Transfer.deleteOne(filter)
				.then(async(result) => {
			
					await addIP(req, "Application Accepted");

					res.status(200).json({
						message: 'application is Accepted.',
						documents: result
					});
				})
		})
	}
	catch(err){
			console.error(err);
			res.status(400).json({
				message: 'error has occured.',
				documents: null,
			});
	};
});


app.post('/reject', (req, res, next) => {
	try {
		const filter = { application_id: req.body.application_id };
		const options = { upsert: true };

		var updatedDoc = req.body;
		updatedDoc['updatedAt'] = new Date();

		var application = new Application(updatedDoc);
		
		application.save().then((result) => {
			Transfer.deleteOne(filter).then(async (result) => {
				await addIP(req, 'Application Rejected');

				res.status(200).json({
					message: 'application is Rejected.',
					documents: result,
				});
			});
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({
			message: 'error has occured.',
			documents: null,
		});
	}
});


app.get('/', (req, res, next) => {
	Application.find()
		.sort('-updatedAt')
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/transferapps', (req, res, next) => {

	var filter;
	if (req.user.code) {
		filter = { ioPhoneNumber: req.user.tokenkey };	
	}
	else {
		filter = { target: req.user.tokenkey };
	}
	console.log(filter);
	Transfer.find(filter)
		.sort('-updatedAt')
		.then(async (documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.get('/:application_id', (req, res, next) => {
	Application.find({ application_id: req.params.application_id })
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.get('/io/:ioPhoneNumber', (req, res, next) => {
	Application.find({ ioPhoneNumber: req.params.ioPhoneNumber })
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/department/:name', (req, res, next) => {
	Application.find({ path: { "$regex": ".*"+ req.params.name +".*"} })
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/:status/:month', (req, res, next) => {
	Application.find({
		application_status: req.params.status,
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
	})
		.sort('-updatedAt')
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/io/:status/:ioPhoneNumber/:month', (req, res, next) => {
	Application.find({
		application_status: req.params.status,
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
		ioPhoneNumber: req.params.ioPhoneNumber
	})
		.sort('-updatedAt')
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.get('/department/:status/:name/:month', (req, res, next) => {
	Application.find({
		application_status: req.params.status,
		application_date: {
			$lt: new Date(new Date().getTime() - req.params.month * 30 * 24* 3600 * 1000),
		},
		path: { $regex: '.*' + req.params.name + '.*' }
	})
		.sort('-updatedAt')
		.then(async(documents) => {

			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/IMEI', (req, res, next) => {
	Application.find({
		IMEI_NO: { $exists: true },
	})
		.sort('-updatedAt')
		.then(async (documents) => {
			res.status(200).json({
				message: 'Applications fetched successfully.',
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

app.get('/IMEI/:IMEI_NO', (req, res, next) => {
	Application.find({
		IMEI_NO : req.params.IMEI_NO
	})
		.sort('-updatedAt')
		.then(async (documents) => {

			if (documents === null) {
				res.status(200).json({
					message: 'IMEI NO is not reported.',
					documents: documents,
				});		
			}

			res.status(200).json({
				message: 'Applications fetched successfully.',
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


app.delete('/:id', (req, res, next) => {
	var filter = { application_id: req.params.id };
	Application.deleteOne(filter)
		.then(async(document) => {

			await addIP(req, "Application Deleted");

			res.status(200).json({
				message: 'Application is deleted.',
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
		executedOnWhat: req.body.application_id,
		message: message,
		time: new Date(),
	});

	if (req.user.code !== null) {
		ipEntry['extraInfo'] = req.user.code;
	}
	await ipEntry.save();
}

module.exports = app;