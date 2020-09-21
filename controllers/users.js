var userModel = require("../models/user");
var nodemailer = require("nodemailer");
var config = require("../config/config");
const Cryptr = require("cryptr");
const cryptr = new Cryptr(config.secretKey);
const bcrypt = require("bcrypt");
const saltRounds = 10;
var moment = require("moment");
var _ = require("lodash");

var users = {
  getAll: function (req, res) {
    userModel.find(function (err, docs) {
      if (err) {
        res.status(500).json({
          status: "error",
          message: "Database Error:" + err,
          docs: "",
        });
      } else {
        res
          .status(200)
          .json({ status: "success", message: "success", docs: docs });
      }
    });
  },
  getOne: function (req, res) {
    userModel.findById(req.params.id, function (err, doc) {
      if (err) {
        res.status(500).json({
          status: "error",
          message: "Database Error:" + err,
          docs: "",
        });
      } else {
        doc.password = "";
        res
          .status(200)
          .json({ status: "success", message: "success", docs: doc });
      }
    });
  },
  create: function (req, res) {
    var user = new userModel();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.password = req.body.password;
    // user.status = 'ACTIVE';
    user.status = req.body.status;

    userModel.find({ email: req.body.email }).then((result) => {
      if (result > 0) {
        res
          .status(400)
          .json({ status: "Error", message: "User already present" });
      } else {
        user.save(function (err, user) {
          if (err) {
            res.status(500).json({
              status: "Error",
              message: "Something went wrong",
              error: err,
              docs: "",
            });
          } else {
            const encryptedUserId = cryptr.encrypt(user._id);

            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "tigerkiller007@gmail.com",
                pass: "Dreamz@09",
              },
            });

            var mailOptions = {
              from: "tigerkiller007@gmail.com",
              to: user.email,
              subject: "SSC Exam -User Activation",
              text: config.webAppUrl + "auth/verify-user/" + encryptedUserId,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (err) {
                console.log('err', err);
                res.status(500).json({
                  status: "Error",
                  message: "Something went wrong",
                  error: err,
                  docs: "",
                });
              } else {
                res.status(200).json({
                  status: "success",
                });
              }
            });
          }
        });
      }
    });
  },
  createByAdmin: async function (req, res) {
    let orgPassword =
      _.take(req.body.firstName, 1) +
      "@" +
      moment().format("YYYY") +
      "$" +
      _.take(req.body.lastName, 1);
    var user = new userModel();

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.admin = req.body.admin;
    user.password = orgPassword;
    user.admin = req.body.admin;
    user.gender = req.body.gender;
    user.location = req.body.location;
    user.website = req.body.website;
    user.picture = req.body.picture;
    user.facebook = req.body.facebook;
    user.twitter = req.body.twitter;
    user.google = req.body.google;
    user.github = req.body.github;
    user.vk = req.body.vk;
    user.status = "ACTIVE";

    userModel.find({ email: req.body.email }).then((result) => {
      if (result > 0) {
        res
          .status(400)
          .json({ status: "Error", message: "User already present" });
      } else {
        user.save(function (err) {
          if (err) {
            res.status(500).json({
              status: "Error",
              message: "Something went wrong",
              error: err,
              docs: "",
            });
          } else {
            const encryptedUserId = cryptr.encrypt(user._id);

            var transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: "tigerkiller007@gmail.com",
                pass: "Dreamz@09",
              },
            });

            var mailOptions = {
              from: "tigerkiller007@gmail.com",
              to: user.email,
              subject: "SSC Exam -User Activation",
              text: config.webAppUrl + "auth/verify-user/" + encryptedUserId,
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (err) {
                console.log('err', err);
                res.status(500).json({
                  status: "Error",
                  message: "Something went wrong",
                  error: err,
                  docs: "",
                });
              } else {
                res.status(200).json({
                  status: "success",
                });
              }
            });
          }
        });
      }
    });
  },
  update: function (req, res) {
    let updatedUser = {};
    updatedUser.admin = req.body.admin;

    updatedUser.firstName = req.body.firstName;
    updatedUser.lastName = req.body.lastName;
    updatedUser.email = req.body.email;
    updatedUser.phone = req.body.phone;
    updatedUser.password = req.body.password;
    updatedUser.gender = req.body.gender;
    updatedUser.admin = req.body.admin;
    updatedUser.location = req.body.location;
    updatedUser.website = req.body.website;
    updatedUser.picture = req.body.picture;
    updatedUser.facebook = req.body.facebook;
    updatedUser.twitter = req.body.twitter;
    updatedUser.google = req.body.google;
    updatedUser.github = req.body.github;
    updatedUser.vk = req.body.vk;

    userModel.update({ _id: req.params.id }, updatedUser, function (err, user) {
      if (err)
        res.status(500).json({
          status: "Error",
          message: "Something went wrong",
          error: err,
          docs: "",
        });
      else
        res.status(200).json({
          status: "success",
          message: "Document updated Successfully",
          docs: "",
        });

    });
  },
  delete: function (req, res) {
    userModel.remove(
      {
        _id: req.params.id,
      },
      function (err, user) {
        if (err) {
          res.status(500).json({
            status: "Error",
            message: "Something went wrong",
            error: err,
            docs: "",
          });
        } else {
          res.status(200).json({
            status: "success",
            message: "Document deleted Successfully",
            docs: "",
          });
        }
      }
    );
  },
  VerifyUser: function (req, res) {
    console.log(req.body);
    const userId = cryptr.decrypt(req.body.id);
    console.log(typeof userId);
    userModel.findById({ _id: userId }, function (err, user) {
      if (err) {
        res.status(500).json({
          status: "Error",
          message: "Something went wrong",
          error: err,
          docs: "",
        });
      } else {
        userModel
          .updateOne({ _id: userId }, { $set: { status: "ACTIVE" } })
          .exec()
          .then((result) => {
            console.log(result);
            res.status(200).json({
              status: "success",
              message: "User Activeted Successfully",
              docs: "",
            });
          });
      }
    });
  },
  changePassword: function (req, res) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
        console.log(req.body);
        if (!req.body.oldPassword) {
          res.status(400).json({
            status: "error",
            message: "Please enter current password.",
          });
        } else if (!req.body.newPassword) {
          res.status(400).json({
            status: "error",
            message: "Please enter new password.",
          });
        } else {
          console.log(req.user._id);
          userModel.findById(req.user._id, (err, data) => {
            bcrypt.compare(req.body.oldPassword, data.password, function (
              err,
              result
            ) {
              if (result) {
                userModel.findByIdAndUpdate(
                  req.user._id,
                  { password: hash },
                  (err, doc) => {
                    if (!!err) {
                      res.status(500).json({
                        status: "Error",
                        message: "Something went wrong",
                        error: err,
                      });
                    } else {
                      res.status(201).json({
                        status: "success",
                        message: "Password updated successfully",
                      });
                    }
                  }
                );
              } else {
                res.status(400).json({
                  status: "error",
                  message: "Current password entered is incorrect.",
                  currentPasswordIncorrect: true,
                });
              }
            });
          });
        }
      });
    });
  },
};

module.exports = users;
