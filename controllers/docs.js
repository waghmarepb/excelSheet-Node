// var docsModel = require('../models/tempDocs');
// //var multer = require('multer');
// var config = require('../config/config');

// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');
// var XLSX = require('xlsx');
// var docs = {
//     create: function (req, res) {

//         var doc = new docsModel();

//         doc.file = req.file.path;
//         //configuring the AWS environment
//         AWS.config.update({
//             accessKeyId: config.s3Bucket.accessKeyId,
//             secretAccessKey: config.s3Bucket.secretAccessKey,
//         });
//         AWS.config.httpOptions.timeout = 0;
//         var s3 = new AWS.S3();
//         var filePath = doc.file;
//         //configuring parameters
//         let dt = new Date()
//         let dtStr = dt.getFullYear() + '/' + dt.getMonth() + '/' + dt.getDate()
//         var params = {
//             Bucket: config.s3Bucket.bucket,
//             Body: fs.createReadStream(filePath),
//             Key: dtStr + "_" + path.basename(filePath)
//         };
//         var options = { queueSize: 1 };
//         s3.upload(params, options, function (err, data) {
//             //handle error
//             if (err) {
//                 console.log(err);
//                 res.status(400).json({ status: err, message: 'Documents upload failed', })
//             }
//             //success
//             if (data) {
//                 console.log("Uploaded in:", data.Location);
//                 doc.name = req.file.originalname;
//                 doc.file = data.Location;
//                 doc.save(function (err) {
//                     if (err) {
//                         res.status(500).json({
//                             status: 'error',
//                             message: 'Database Error:' + err,
//                             docs: ''
//                         });
//                     } else {
//                         res.status(200).json({
//                             status: 'success',
//                             message: 'Document Added Successfully',
//                             fileInfo: {
//                                 'file': data.Location,
//                                 'name': req.file.originalname
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     },

//     createExcel: function (req, res) {
//         console.log('path', req.file.path);
//         var workbook = XLSX.readFile(req.file.path);
//         var sheet_name_list = workbook.SheetNames;
//         console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
//         var newData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
//         res.status(200).json({ status: 'success', message: 'Documents uploaded successfully', data: newData })
//     }
// }
// module.exports = docs;

var docsModel = require('../models/tempDocs');
var config = require('../config/config');

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
var XLSX = require('xlsx');

var docs = {
    create: async function (req, res) {
        var doc = new docsModel();
        doc.file = req.file.path;

        // Initialize the S3 client
        const s3Client = new S3Client({
            region: config.s3Bucket.region,
            credentials: {
                accessKeyId: config.s3Bucket.accessKeyId,
                secretAccessKey: config.s3Bucket.secretAccessKey,
            },
        });

        var filePath = doc.file;
        let dt = new Date();
        let dtStr = dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
        var key = dtStr + "_" + path.basename(filePath);

        try {
            const fileStream = fs.createReadStream(filePath);
            const uploadParams = {
                Bucket: config.s3Bucket.bucket,
                Key: key,
                Body: fileStream,
            };

            const command = new PutObjectCommand(uploadParams);
            const data = await s3Client.send(command);

            console.log("Uploaded in:", `https://${config.s3Bucket.bucket}.s3.${config.s3Bucket.region}.amazonaws.com/${key}`);
            doc.name = req.file.originalname;
            doc.file = `https://${config.s3Bucket.bucket}.s3.${config.s3Bucket.region}.amazonaws.com/${key}`;
            doc.save(function (err) {
                if (err) {
                    res.status(500).json({ status: err, message: 'Error saving document' });
                } else {
                    res.status(200).json({ status: 'success', message: 'Document uploaded and saved successfully' });
                }
            });
        } catch (err) {
            console.log(err);
            res.status(400).json({ status: err, message: 'Documents upload failed' });
        }
    },

    createExcel: function (req, res) {
        console.log('path', req.file.path);
        var workbook = XLSX.readFile(req.file.path);
        var sheet_name_list = workbook.SheetNames;
        console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]));
        var newData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
        res.status(200).json({ status: 'success', message: 'Documents uploaded successfully', data: newData })
    }
};

module.exports = docs;