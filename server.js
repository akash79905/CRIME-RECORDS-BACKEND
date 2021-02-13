const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

const adminRoute = require("./routes/adminRoute");
const departmentRoute = require("./routes/departmentRoute");
const IORoute = require("./routes/ioRoute");
const registerRoute = require("./routes/registerRoute");
const categoryRoute = require("./routes/categoryRoute")
const subcategoryRoute = require("./routes/subcategoryRoute");
const applicationRoute = require("./routes/applicationRoute");

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
app.use('/api/register', registerRoute);
app.use('/api/category', categoryRoute);
app.use('/api/subcategory', subcategoryRoute);
app.use('/api/application', applicationRoute);