var peopleModel = require('../models/people');
var glcModel = require('../models/glc');

var peoples = {

    getAll: function (req, res) {
        let condition = {}
        if (!req.user.admin) {
            condition = { createdBy: req.user._id,status:"ACTIVE" }
        }else{
            condition = { status:"ACTIVE" }
        }
        peopleModel.find(condition, function (err, docs) {
          
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
    getOne: function (req, res) {

        peopleModel
            .findOne({_id:req.params.id ,status :"ACTIVE"})
            .populate({
                path: 'createdBy',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'notes.user',
                select: 'firstName lastName email'
            })
            .then(async (result) => {
                if (!result) {
                    res.status(400).json({
                        status: 'error',
                        message: 'Person not found',
                        docs: ''
                    });
                } else {
                    var glcResult = await glcModel.find({
                        person: req.params.id,
                        user: result.createdBy._id
                    });
                    console.log(result);
                    res.status(200).json({
                        status: 'success',
                        message: 'success',
                        people: result,
                        GLC: glcResult
                    });
                }
            }).catch((error) => {
                res.status(500).json({
                    status: 'error',
                    message: 'Database Error:' + error,
                    docs: ''
                });
            })
    },
    create: function (req, res) {

        var people = new peopleModel();

        people.firstName = req.body.firstName;
        people.middleName = req.body.middleName;
        people.lastName = req.body.lastName;
        people.dob = req.body.dob;
        people.phone = req.body.phone;
        people.physicalAddress = req.body.physicalAddress;
        people.mailingAddress = req.body.mailingAddress;
        people.email = req.body.email;
        people.gender = req.body.gender;
        people.location = req.body.location;
        people.website = req.body.website;
        people.picture = req.body.picture;
        people.facebook = req.body.facebook;
        people.twitter = req.body.twitter;
        people.google = req.body.google
        people.createdBy = req.user._id;
        people.notes = req.body.notes;
        people.linkedin= req.body.linkedin;
        people.status ="ACTIVE"
        people.save(function (err) {
            if (err) {
                res.status(500).json({
                    status: 'error',
                    message: 'Database Error:' + err,
                    docs: ''
                });
            } else {

                res.status(200).json({
                    status: 'success',
                    message: 'Document Added Successfully',
                    docs: ''
                });
            }

        });
    },
    update: function (req, res) {
        peopleModel.findById(req.params.id, function (err, people) {
            if (err)
                res.status(500).json({
                    status: 'error',
                    message: 'Database Error:' + err,
                    docs: ''
                });

            people.createdBy = req.body.createdBy;
            people.notes = req.body.notes;
            people.firstName = req.body.firstName;
            people.middleName = req.body.middleName;
            people.lastName = req.body.lastName;
            people.dob = req.body.dob;
            people.phone = req.body.phone;
            people.physicalAddress = req.body.physicalAddress;
            people.mailingAddress = req.body.mailingAddress;
            people.email = req.body.email;
            people.gender = req.body.gender;
            people.location = req.body.location;
            people.website = req.body.website;
            people.picture = req.body.picture;
            people.facebook = req.body.facebook;
            people.twitter = req.body.twitter;
            people.google = req.body.google;
            people.linkedin= req.body.linkedin;
            people.status ="ACTIVE"
            // save the doc
            people.save(function (err) {
                if (err) {
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });
                } else {

                    res.status(200).json({
                        status: 'success',
                        message: 'Document updated Successfully',
                        docs: ''
                    });
                }
            });

        });

    },
    updateNotes: function (req, res) {
        let notes = req.body;
        console.log(notes);
        peopleModel.findByIdAndUpdate({
            _id: req.params.id
        }, {
                $push: {
                    notes: notes
                }
            }, function (err, response) {

                if (err)
                    res.status(500).json({
                        status: 'error',
                        message: 'Database Error:' + err,
                        docs: ''
                    });

                // save the doc
                else {
                    res.status(200).json({
                        status: 'success',
                        message: 'Document updated Successfully',
                        docs: ""
                    });
                }

            });

    },
    delete: function (req, res) {
        peopleModel.updateOne({_id: req.params.id},{$set: {status:'DEACTIVE'}}, function (err, user) {
            if (err) {
                res.status(500).json({
                    status: 'error',
                    message: 'Database Error:' + err,
                    docs: ''
                });
            } else {

                res.status(200).json({
                    status: 'success',
                    message: 'Document deleted Successfully',
                    docs: ''
                });
            }
        });
    }
};

module.exports = peoples;