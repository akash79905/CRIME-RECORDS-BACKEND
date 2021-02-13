/** @format */

const express = require('express');
const app = express();
const Department = require('../models/Department');
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.post('/signup', async (req, res, next) => {
	try {
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
			const doc = await Department.findOne({ name: req.body.subDepartmentOf })
			var path = doc.path;
			path = path + '/' + req.body.name;
			department.path = path
		}
		else {
			department['path'] = req.body.name;
		}

		const dep = await department.save()
		res.json({
			message:"department added.",
			documents: dep,
		})
		console.log(dep);
	}
	catch (err)
	{
		console.log(err);
	}
});

app.post('/login', async (req, res, next) => { 
	Department.findOne({ name: req.body.name })
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


app.post('/update', async(req, res, next) => {
	const filter = { name: req.body.name };
	const options = { upsert: true };

	const updatedDoc = {
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

	Department.updateOne(filter, updatedDoc, options)
        .then((result) => {
			res.status(201).json({
				message: 'department is updated.',
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
	Department.find()
		.sort('-updatedAt')
		.then((documents) => {
			res.status(200).json({
				message: 'All Departments Details fetched successfully.',
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

app.get('/:name', (req, res, next) => {
    Department.findOne({name: req.params.name})
		.then((document) => {
			res.status(200).json({
				message: 'Department Details fetched successfully.',
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

app.delete('/:name', (req, res, next) => {
	var filter = { name: req.params.name };
	Department.deleteOne(filter)
		.then((document) => {
			res.status(200).json({
				message: 'Department is deleted.',
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
