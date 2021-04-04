const express = require('express')
const common = require('./common/Common')
const User = require('../models').user
const List = require('../models').list
const Item = require('../models').item
const mongoose = require('mongoose')
const fs = require('fs')
const multer = require('multer')
const { generateHash } = require('./Utilities')
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

router.patch('/update/:token', (req, res) => {
    const token = req.params.token
    const updatedData = {
        username: req.body.username,
        email: req.body.email
    }

    common.readResponseFile( response => {
        User.updateOne({token: token}, updatedData, (...args) => {
            response.code = 1
            response.message = 'User updated succesfully'
            res.status(200).json(response)
        })
    })
})

router.patch('/update/password/:token',(req, res) => {
    const token = req.params.token
    generateHash(req.body.password, (hash) => {
        common.readResponseFile( response => {
            User.updateOne({token: token}, {password: hash}, (...args) => {
                response.code = 1
                response.message = 'Password updated succesfully'
                res.status(200).json(response)
            })
        })
    })
})

router.get('/lists/:token', (req, res) => {
    const token = req.params.token
    

    User.findOne({token: token}, (err, user) => {
        const userId = mongoose.Types.ObjectId(user._id)
        List.find({user: {$in: [userId]}}, (err, lists) => {
            console.log(lists);
            res.status(200).json({data: lists})
        })
    })
})

module.exports = router