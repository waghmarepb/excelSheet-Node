var jwt = require('jwt-simple');
var userModel = require('../models/user');
var config = require('../config/config');


var validate = {

    validateUser: function (req, res, next) {

        var token = req.body.token || req.headers['x-access-token'];
        try {
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
                    $and: [
                        { 'email': decoded.email },
                    ]
                },
                    function (err, user) {
                        if (err || !user) {
                            res.status(400).json({ status: 'error', message: 'Bad Request, token not valid' });
                        } else {
                            req.user = user
                            next();
                        }
                    });
            }
        } catch (err) {
            console.log(err);

            res.status(400);
            res.json({
                "status": "error",
                "message": err.message || "Oops something went wrong"
            });
        }
    },

    validateAdmin: function (req, res, next) {

        var token = req.body.token || req.headers['x-access-token'];
        try {
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
                    $and: [
                        { 'email': decoded.email },
                    ]
                },
                    function (err, user) {
                        if (err || !user) {
                            res.status(400).json({ status: 'error', message: 'Bad Request, invalid token' });
                        } else {
                            req.user = user
                            if(req.user.admin){
                                next();
                            }else{
                                res.status(401).json({ status: 'error', message: 'Bad Request, Permission denied' });
                            }
                        }
                    });
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
};

module.exports = validate;
