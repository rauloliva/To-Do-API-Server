const express = require('express')
const User = require('../models').user
const fs = require('fs')
const multer = require('multer')
var storage = multer.diskStorage({
    destination: 'photos/',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage})
const router = express.Router()

router.post('/photo/:token', upload.single('file'), (req, res) => {
    const token = req.params.token
    const photoObj = {
        filename: req.file.filename,
        mimetype: req.file.mimetype 
    }
    User.updateOne({token: token}, {photo: photoObj}, (...args) => {
        fs.readFile('photos/'+req.file.filename, (err, data) => {
            res.json({
                photo: `data:${photoObj.mimetype};base64,${data.toString('base64')}`
            })
        })
   })
})

module.exports = router