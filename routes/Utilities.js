const fs = require('fs')
const bcrypt = require('bcrypt')
const User = require('../models').user

const getPhoto = (user, cb) => {
    if(user == null) {
        cb(user)
        return
    }

    if(user.photo !== undefined) {
        var photo = user.photo.filename
        if(!photo.includes('https')) {
            fs.readFile('photos/'+photo, (err, data) => {
                user.photo.original = photo
                user.photo.filename = `data:${user.photo.mimetype};base64,${data.toString('base64')}`
                cb(user)
            })
        } else{
            cb(user)
        }
    } else {
        cb(user)
    }
}

const generateHash = (data, cb) => {
    bcrypt.genSalt(parseInt(process.env.SALT_ROUND), (err, salt) => {
        bcrypt.hash(data, salt, (error, hash) => {
            cb(hash)
        })
    })
}

const validatePassword = (password, hash, cb) => bcrypt.compare(password, hash, cb)

module.exports = { getPhoto, generateHash, validatePassword, passwordChanged }