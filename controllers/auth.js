var jwt = require('jwt-simple');
var userModel = require('../models/user');
var config = require('../config/config');
var resetTokenModel = require('../models/resetToken');
const bcrypt = require('bcrypt')
const saltRounds = 10;


var auth = {
    // userLogin: function (req, res) {

    //     var usersProjection = {
    //         __v: false,
    //         password: false
    //     };
    //     userModel.findOne({
    //         $and: [{
    //             'email': req.body.email
    //         },
    //         {
    //             'password': req.body.password
    //         },
    //         {
    //             'status': 'ACTIVE'
    //         }
    //         ]
    //     }, usersProjection,
    //         function (err, user) {
    //             if (err || !user) {
    //                 res.status(400).json({
    //                     status: 'error',
    //                     message: 'Invalid login credentials'
    //                 });
    //             } else {

    //                 var payload = {
    //                     email: user.email,
    //                     _id: user._id,
    //                     exp: (new Date()).setDate(new Date().getDate() + config.loginTokenExpiryDays)
    //                 };
    //                 var token = jwt.encode(payload, config.secretKey);
    //                 user = JSON.parse(JSON.stringify(user));
    //                 user.token = token;
    //                 res.status(200).json({
    //                     status: 'success',
    //                     message: 'Login success.',
    //                     user: user
    //                 });
    //             }
    //         });
    // },


    userLogin: function (req, res) {
        var usersProjection = {
            __v: false,
            password: false
        };
        userModel.findOne({ email: req.body.email })
            .then((user) => {

                bcrypt.compare(req.body.password, user.password, function (err, result) {


                    if (result) {

                        if (user.status != 'ACTIVE') {
                            res.status(400).json({
                                status: 'error',
                                message: 'Please active your account by verifying your mail'
                            });
                        } else {

                            var payload = {
                                email: user.email,
                                _id: user._id,
                                exp: (new Date()).setDate(new Date().getDate() + config.loginTokenExpiryDays)
                            };
                            var token = jwt.encode(payload, config.secretKey);
                            user = JSON.parse(JSON.stringify(user));
                            user.token = token;
                            user.password = '';
                            user.__v = '';
                            res.status(200).json({
                                status: 'success',
                                message: 'Login success.',
                                user: user
                            });
                        }
                    } else {
                        res.status(400).json({
                            status: 'error',
                            message: 'Invalid login credentials'
                        });
                    }
                })
            }).catch((error) => {
                res.status(400).json({
                    status: 'error',
                    message: 'Invalid login credentials'
                });
            })
    },

    // reset mail
    resetPasswordMail: async (req, res) => {
        userModel.findOne({
            email: req.body.email
        })
            .then(user => {

                if (!user) {
                    res.status(401).json({
                        message: 'Authentication failed/user doesnt exit'
                    });
                } else {

                    var result = '';

                    var characters = '#!$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    var charactersLength = characters.length;
                    for (var i = 0; i < 15; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }

                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(result, salt, function (err, hash) {

                            var token = new resetTokenModel();
                            token.user = user._id
                            token.token = hash;
                            token.expiresOn = (new Date()).setDate(new Date().getDate() + config.loginTokenExpiryDays)
                            token.save().then((tokendata => {

                                var emailPayload = {
                                    "senderId": config.email.senderId,
                                    "event": "Greenlight Check - Reset Password",
                                    "headers": {
                                        "from": config.email.headers.fromEmailId,
                                        "fromName": config.email.headers.fromName,
                                        "to": user.email,
                                        "toName": user.firstName + " " + user.lastName,
                                        "replyTo": "",
                                        "bcc": "",
                                        "cc": "",
                                        "mobileNumber": ""
                                    },
                                    "templateVars": {
                                        "firstName": user.firstName + " ",
                                        "resetPasswordUrl": config.webAppUrl + "auth/reset-password/" + encodeURIComponent(hash)
                                    }
                                }
                                emailHelper.sendEmail(emailPayload, function (err, success) {
                                    if (err) {
                                        res.status(500).json({
                                            status: 'error',
                                            message: 'Error with email:' + err,
                                            docs: ''
                                        });

                                    } else {
                                        res.status(200).json({
                                            status: 'success',
                                        });
                                    }
                                })
                            }))
                        });
                    });
                }
            });
    },

    tokenVerify: (req, res) => {
        console.log(req.body)
        resetTokenModel.findOne({
            token: req.body.id
        }).exec((err, data) => {
            console.log('data', data)
            if (!!err || !data) {
                res.status(400).json({
                    status: 'error',
                    message: 'Link exipired',
                    tokenExpired: true
                });
            }
            else if (data['expiresOn'] < (new Date()).getTime()) {
                res.status(400).json({
                    status: 'error',
                    message: 'Link exipired',
                    tokenExpired: true
                });
            }
            else {
                res.status(200).json({
                    status: 'success',
                    message: '',
                    user: data
                });
            }
        })
    },
    resetPassword: (req, res) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(req.body.password, salt, function (err, hash) {
                resetTokenModel.findOne({
                    token: req.body.id
                }).populate({
                    path: 'user'
                }).then((data) => {

                    query = {
                        _id: data.user._id
                    }
                    userModel.updateOne(query, {
                        $set: {
                            password: hash
                        }
                    }).then((result) => {
                        resetTokenModel.findOneAndDelete({ token: req.body.id },
                            (err, user) => {
                                console.log(user);
                                if (err || !user) {
                                    res.status(500).json({ status: 'Error', message: 'Something went wrong', error: err, docs: '' });
                                } else {
                                    res.status(200).json({
                                        status: 'success',
                                        message: 'password reset success.',
                                        user: user
                                    });
                                }
                            })
                    })
                })
            })
        })
    },

    validateToken: (req, res) => {
        var token = req.body.token
        try {
            if (!token) {
                res
                    .status(400)
                    .json({
                        status: 'error',
                        message: 'Token not supplied',
                    });
            } else {
                var decoded = jwt.decode(token, config.secretKey);
                if (!decoded['exp'] || decoded['exp'] < (new Date()).getTime()) {
                    res
                        .status(400)
                        .json({
                            status: 'error',
                            message: 'Token expired. Please login again',
                            tokenExpired: true
                        });
                } else {
                    userModel.findOne({
                        $and: [{
                            'email': decoded.email
                        },]
                    },
                        function (err, user) {
                            if (err || !user) {
                                res.status(400).json({
                                    status: 'error',
                                    message: 'Bad Request, token not valid',
                                    tokenExpired: true
                                });
                            } else {
                                res.status(200).json({
                                    status: 'success',
                                    message: 'Token is valid'
                                });
                            }
                        });
                }

            }
        } catch (err) {
            console.log(err);

            res.status(400);
            res.json({
                "status": "error",
                "message": err.message || "Oops something went wrong"
            });
        }
    }

}

module.exports = auth;