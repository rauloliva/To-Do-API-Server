const express = require('express')
const User = require('../DBModels/models').user
const multer = require('multer')
const upload = multer({dest: 'photos/'})
const passport = require('passport')
const router = express.Router()

router.post('/register', upload.single('photo'), (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        photo: [] //req.file.filename, req.file.originalname
    })
    const response = { res: null, status: 0 }
    
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            res.json({error: err, status: 0, message: 'The user could not be created'})
        } else {
            passport.authenticate('local')(req, res, () => res.status(201).json({status: 200, message: 'User created', user: user}))
        }
    })
})

router.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    // res.json({
    //     usernam: username,
    //     password: password,
    //     email: email
    // })

    req.logIn(user, err => {
        if(err) {
            res.json({error: err})
        } else {
            passport.authenticate("local")(req, res, () => {
                res.json('User logged In')
            })
        }
    })
})

module.exports = router