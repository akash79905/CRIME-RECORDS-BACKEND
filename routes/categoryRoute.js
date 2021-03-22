/** @format */

const express = require('express');
const app = express();
const IP = require('../models/IP');
const Category = require('../models/Category');
const RequestIp = require('@supercharge/request-ip');

app.post('/add', (req, res, next) => {
    const category = new Category({
        name: req.body.name,
        active_flag: true,
		createdAt: new Date(),
		updatedAt: new Date(),
	});


	category.save().then(async(result) => {
		
		await addIP(req, "Category Added");

		res.status(200).json({
			documents: result,
		});
    })
    .catch((err) => {
        console.error(err);
        res.status(400).json({
            message: 'error has occured.',
            documents: null
        })
    });    
});

app.post('/update', (req, res, next) => {
	const filter = { name: req.body.name };
	const options = { upsert: true };

	const updatedDoc = {
		$set: {
			name: req.body.name,
            active_flag: req.body.active_flag,
			updatedAt: new Date(),
		},
	};

	Category.updateOne(filter, updatedDoc, options)
		.then(async (result) => {
			
			await addIP(req, 'Category Updated');

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

app.get('/', (req, res, next) => {
	Category.find()
		.sort('-updatedAt')
		.then(async (documents) => {

			res.status(200).json({
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

app.get('/:name', (req, res, next) => {
	var filter = { name: req.params.name };
	Category.findOne(filter)
		.then(async (document) => {
			
			res.status(200).json({
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).json({
				documents: null,
			});
		});
});


app.delete('/:name', (req, res, next) => {
	var filter = { name: req.params.name };
	Category.deleteOne(filter)
		.then(async (document) => {

			await addIP(req, 'Category Deleted');

			res.status(200).json({
				documents: document,
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(400).json({
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
