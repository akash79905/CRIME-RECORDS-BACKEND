const express = require('express');
const app = express();
const IP = require('../models/IP');
const Order = require('../models/Order');
const RequestIp = require('@supercharge/request-ip');
const SubCategory = require('../models/SubCategory');
const Application = require('../models/Application');
const Department = require('../models/Department');
const IO = require('../models/IO');

app.get('/', async(req, res, next) => {

    var list = await SubCategory.find();
    var initialList = list.map((item) => { return { name: item.name, count: 0 } });

    console.log(req.user);

    var response = await getReportFromChild(req.user.tokenkey, initialList);
    console.log(response);

    if (response !== null) {

        addIP(req, "Report Generated")

        res.status(200).json({
            message: "Report Generated.",
            document: response
        })    
    }
    else {
        res.status(400).json({
            message: "Error Occured in Generating Report.",
            document: null
        })
    }
 })

async function getReportFromChild(parentName, initialList) {
    
    if (!isNaN(parentName)) {
        parentName = parentName.toString();
    }

    var finalList = JSON.parse(JSON.stringify(initialList));
    var children = [];
    await Order.find({ parent: parentName })
    .then(async(result) => {
      
        for (item of result) {
            
            var child = await getReportFromChild(item.child, initialList);
            children.push(child);
            var childSubList = child.sublist;

            finalList = finalList.map((item, idx) => {
                return { name: item.name ,count: item.count + childSubList[idx].count }
            });
        }
    })
    
    await Application.aggregate([{ $match: { at_stage: parentName, application_status: "pending" } },{ $group: { _id: '$application_subcategory', count: { $sum: 1 } } },])
    .then((document) => {
        
        for (item of document) {
            var index = finalList.findIndex(x => x.name === item._id);
            finalList[index].count += item.count;
        }
    });

    

    var finalResult = { name: parentName};
    if (isNaN(parentName)) {
        await Department.findOne({ name: parentName }).then((result) => { finalResult['headname'] = result.departmentHeadName; })
    }
    else{
        await IO.findOne({ phoneNumber: Number(parentName) }).then((result) => { finalResult['headname'] = result.fullName; })
    }

    finalResult['sublist'] = finalList;
    if (children.length !== 0) {
        finalResult['child'] = children;
    }
    return finalResult;
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