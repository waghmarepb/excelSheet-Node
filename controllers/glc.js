var GlcModel = require('../models/glc');
var config = require('../config/config')
var glcs = {
    getAll: function (req, res) {

        var condition = {};
        if (!req.user.admin) {
            condition = { 'user': req.user._id };
        }

        GlcModel.find(condition).
            limit(100).
            sort({ createdAt: -1 }).
            exec(function (err, docs) {
                if (err) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: 'success',
                        docs: docs
                    });
                }
            })
    },
    getOne: function (req, res) {
        console.log("mich ", req.params.id);

        GlcModel.findById({
            _id: req.params.id
        })
            .populate("user")
            .populate("person")
            .exec(function (err, doc) {
                if (err) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });
                } else {

                    res.status(200).json({
                        status: 'success',
                        message: 'success',
                        docs: doc
                    });
                }
            });
    },
    getPending: function (req, res) {

        var condition = {};;
        if (!req.user.admin) {
            condition = { 'user': req.user._id };
        }

        GlcModel.find({
            ...condition,
            $or: [{
                status: 'Pending'
            },
            {
                status: 'In-Review'
            }]
        })
            .populate("user")
            .populate('person')
            .limit(100)
            .sort({ createdAt: -1 })
            .exec(function (err, docs) {
                if (err) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });
                } else {

                    res.status(200).json({
                        status: 'success',
                        message: 'success',
                        docs: docs
                    });
                }
            });
    },

    create: function (req, res) {

        var newDocs = [];
        let count = req.body.length;
        req.body.forEach((key, element) => {
            if ((count - 1) !== element) {
                newDocs.push(key);
            }
        });
        GlcModel.insertMany(newDocs, (err, response) => {
            if (err) {
                console.log('eee', err);
                res.status(500).json({
                    status: 'error',
                    message: 'Database Error:' + err,
                    docs: ''
                });
            } else {
                console.log('response', response);

                res.status(200).json({
                    status: 'success',
                    message: 'Records Added Successfully',
                    docs: ''
                });
            }
        });
    },
    update: function (req, res) {

        glcModel.findById({
            _id: req.params.id
        })
            .populate("user")
            .populate("person")
            .exec(function (err, glc) {

                if (err)
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });
                glc.status = req.body.status ? req.body.status : glc.status;
                glc.remark = req.body.remark ? req.body.remark : glc.remark;
                glc.docs = req.body.docs ? req.body.docs : glc.docs;

                // save the doc
                glcModel.findByIdAndUpdate(glc._id, {
                    $set: {
                        status: req.body.status || glc.status,
                        remark: req.body.remark || glc.remark,
                        docs: req.body.docs || glc.docs
                    }
                }, { new: true }, function (err, doc) {
                    if (err) {
                        res.status(500).json({
                            status: 'error',
                            message: 'Database Error:' + err,
                            docs: ''
                        });
                    } else {

                        if (req.body.status) {
                            var emailPayload = {
                                "senderId": "contractors.bio",
                                "event": "Greenlight Check - Status update",
                                "headers": {
                                    "from": "no-reply@contractors.bio",
                                    "fromName": "Contractors Bio",
                                    "to": glc.user.email,
                                    "toName": glc.user.firstName + " " + glc.user.lastName,
                                    "replyTo": "",
                                    "bcc": "",
                                    "cc": "",
                                    "mobileNumber": "+9192536258525"
                                },
                                "templateVars": {
                                    "firstName": glc.user.firstName + " " + glc.user.lastName,
                                    "peopleDetailsUrl": config.webAppUrl + "people/details/" + glc.person._id,
                                    "referenceNo": "GLC-" + glc.referenceNo,
                                    "personName": glc.person.firstName + " " + glc.person.lastName,
                                }

                            }
                            console.log(emailPayload);
                            emailHelper.sendEmail(emailPayload, function (err, success) {
                                if (err) {
                                    console.log("err in email sending", err)
                                    res.status(500).json({
                                        status: 'error',
                                        message: 'Error with email:' + err,
                                        docs: ''
                                    });

                                } else {
                                    console.log("success in email sending")
                                    res.status(200).json({
                                        status: 'success',
                                        message: 'Status updated Successfully',
                                        docs: glc
                                    });
                                }
                            })
                        } else {
                            res.status(200).json({
                                status: 'success',
                                message: 'Document updated Successfully',
                                docs: glc
                            });
                        }
                    }
                });
            });
    }
};

module.exports = glcs;
