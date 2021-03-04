const express = require('express');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();

const adminRoute = require("./routes/adminRoute");
const departmentRoute = require("./routes/departmentRoute");
const IORoute = require("./routes/ioRoute");
const registerRoute = require("./routes/registerRoute");
const categoryRoute = require("./routes/categoryRoute")
const subcategoryRoute = require("./routes/subcategoryRoute");
const applicationRoute = require("./routes/applicationRoute");
const IPRoute = require("./routes/ipRoute");
const reportRoute = require('./routes/reportRoute');

app.use(express.json());

mongoose
	.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Connected to Database');
	})
	.catch(() => {
		console.log('Connection failed');
	});

app.listen(port, () => {
	console.log(`Server is running on ${port}`);
});

app.use('/api/admin', adminRoute);
app.use('/api/department', departmentRoute);
app.use('/api/IO', IORoute);
app.use('/api/register', verifyToken, registerRoute);
app.use('/api/category', verifyToken, categoryRoute);
app.use('/api/subcategory', verifyToken, subcategoryRoute);
app.use('/api/application', verifyToken, applicationRoute);
app.use('/api/IP', verifyToken, IPRoute);
app.use('/api/report', verifyToken, reportRoute);


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
