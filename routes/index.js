const express = require('express');
const router = express.Router();
var multer = require('multer');
var path = require('path')


const userController = require('../controllers/users');
const peopleController = require('../controllers/people');
const glcController = require('../controllers/glc');
const docsController = require('../controllers/docs');
const authController = require('../controllers/auth');
const dashboardController = require('../controllers/dashboard');
const validateAdmin = require('../middlewares/validateRequest').validateAdmin;


// Auth route
router.post('/auth/login', authController.userLogin);
router.post('/auth/resetPassword', authController.resetPasswordMail);
router.post('/auth/setNewPassword', authController.resetPassword);
router.post('/auth/tokenVerify', authController.tokenVerify);
router.post('/auth/verify', authController.validateToken);


//dashboard Route
router.get('/secure/dashboard', dashboardController.getAll);

// User route
router.post('/users', userController.create);
router.post('/users/VerifyUser', userController.VerifyUser);
router.post('/secure/users', validateAdmin, userController.createByAdmin);
router.get('/secure/users', validateAdmin, userController.getAll);
router.put('/secure/user/changepassword', userController.changePassword);
router.get('/secure/user/:id', userController.getOne);
router.put('/secure/user/:id', userController.update);
router.delete('/secure/user/:id', validateAdmin, userController.delete);

// Admin routes
router.put('/secure/glc/:id', validateAdmin, glcController.update);

// People route
router.get('/secure/peoples', peopleController.getAll);
router.get('/secure/people/:id', peopleController.getOne);
router.post('/secure/peoples', peopleController.create);
router.put('/secure/people/:id', peopleController.update);
router.delete('/secure/people/:id', peopleController.delete);
router.put('/secure/people/note/:id', peopleController.updateNotes)

// Green-light-checks route
router.get('/secure/glc', glcController.getAll);
router.get('/secure/glc/pending/', glcController.getPending);
router.get('/secure/glc/:id', glcController.getOne);
router.post('/secure/glc', glcController.create);



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
})

// File upload
var upload = multer({
    storage: storage
})


router.post('/secure/doc', upload.single('file'), docsController.createExcel)

module.exports = router;