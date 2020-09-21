var userModel = require('../models/user');
var glcModel = require('../models/glc');
var peopleModel = require('../models/people');
var userModel = require('../models/user');
var Async = require("async");

var dashboard = {
    getAll: async function(req, res) {
        try {
            var condition = {};
            if (!req.user.admin) {
                condition = { 'user': req.user._id };
            }
            var lastWeekStart = new Date().setDate(new Date().getDate() - 14);
            var thisWeekStart = new Date().setDate(new Date().getDate() - 7);

            //user Data 
            var userData = {
                count: '',
                percentage: [],
            };

            if (req.user.admin) {
                let createdAt = { $gte: new Date(thisWeekStart) };
                let userThisWeek = await dateWiseUser(userModel, createdAt);
                createdAt = { $gte: new Date(lastWeekStart), $lt: new Date(thisWeekStart) };
                let userLastWeek = await dateWiseUser(userModel, createdAt);
                userData.percentage = await percentage(userLastWeek, userThisWeek);
                userData.count = await userModel.find(condition).countDocuments();

            }

            //GLC data
            var glcData = {
                count: '',
                percentage: [],
                yearData: [],
                monthData: []
            };
            var limit = 8;
            createdAt = { $gte: new Date(thisWeekStart) };
            let glcThisWeek = await dateWiseData(glcModel, condition, createdAt);
            createdAt = { $gte: new Date(lastWeekStart), $lt: new Date(thisWeekStart) };
            let glcLastWeek = await dateWiseData(glcModel, condition, createdAt);
            glcData.percentage = await percentage(glcLastWeek, glcThisWeek);
            glcData.count = await glcModel.find(condition).countDocuments();
            glcData.yearData = await monthwiseData(glcModel, condition);
            glcData.monthData = await dayWiseData(glcModel, limit, condition);
            //People data
            var peopleData = {
                count: '',
                percentage: [],
                yearData: [],
                monthData: []
            };
            createdAt = { $gte: new Date(thisWeekStart) };
            if (!req.user.admin) {
                condition = { 'createdBy': req.user._id };
            }
            let peopleThisWeek = await dateWiseData(peopleModel, condition, createdAt);
            createdAt = { $gte: new Date(lastWeekStart), $lt: new Date(thisWeekStart) };
            let peopleLastWeek = await dateWiseData(peopleModel, condition, createdAt);
            peopleData.percentage = await percentage(peopleLastWeek, peopleThisWeek);
            peopleData.count = await peopleModel.find(condition).countDocuments();
            peopleData.yearData = await monthwiseData(peopleModel, condition);
            peopleData.monthData = await dayWiseData(peopleModel, limit, condition);
            if ((!userData) || !(glcData && peopleData)) {
                console.log(userData, glcData, peopleData)
                res.status(401).json({
                    status: 'Error',
                    message: 'Data received failed'
                })
            } else {
                res.status(200).json({
                    status: 'Success',
                    message: 'Data received successfully',
                    userData: userData,
                    glcData: glcData,
                    peopleData: peopleData
                })
            }
        } catch (e) {
            console.log('e', e)
            res.status(401).json({
                status: 'Error',
                message: 'Data received failed'
            })
        }
    }
}

module.exports = dashboard;


function percentage(valueOne, valueTwo) {
    let result = 0;
    let type;

    if (valueOne < valueTwo) {
        valueOne = valueOne ? valueOne : 1;
        result = ((valueTwo - valueOne) / valueOne) * 100;
        type = true;
    } else if (valueOne > valueTwo) {
        valueTwo = valueTwo ? valueTwo : 1;
        result = ((valueOne - valueTwo) / valueTwo) * 100;
        type = false;
    } else {
        result = 0;
    }
    return [result, type];


}

function dateWiseData(type, condition, createdAt) {

    return type.find({
            ...condition,
            createdAt: createdAt
        })
        .countDocuments()
}


function dateWiseUser(type, createdAt) {

    return type.countDocuments({
        createdAt: createdAt
    });
}

function monthwiseData(type, condition) {

    return type.aggregate([{
            $match: condition
        },
        {
            $project: {
                createdMonth: { $month: "$createdAt" }
            }
        }, {
            $group: {
                _id: "$createdMonth",
                count: {
                    $sum: 1
                }
            }
        }
    ]).exec();

};

function dayWiseData(type, limit, condition) {

    return type.aggregate([{
            $match: { condition }
        },
        {
            $project: {
                ...condition,
                createdWeek: { $week: "$createdAt" }
            }
        }, {
            $group: {
                _id: "$createdWeek",
                count: {
                    $sum: 1
                }
            }
        }, {
            $sort: {
                _id: -1
            }
        }, {
            $limit: limit
        }
    ]);
}