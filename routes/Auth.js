const express = require('express')
const User = require('../DBModels/models').user
const multer = require('multer')
const upload = multer({dest: 'photos/'})
const passport = require('passport')
const readResponseFile = require('./common/Common').readResponseFile
const router = express.Router()

router.post('/register', upload.single('photo'), (req, res) => {
    readResponseFile( response => {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            photo: [] //req.file.filename, req.file.originalname
        })

        User.register(newUser, req.body.password, (err, user) => {
            if(err) {
                response.message = "The user could not be created"
                response.code = 0
                response.error = err
                res.json(response)
            } else {
                passport.authenticate('local')(req, res, () => {
                    response.message = "User Created"
                    response.code = 1
                    response.data = user
                    res.status(201).json(response)
                })
            }
        })
    })
})

router.post('/login', (req, res) => {
    readResponseFile( response => {
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
                response.message = `${process.env.MSG_SERVER_ERROR} ${err}`
                response.code = 0
                response.error = err
                res.status(200).json(response)
            } else {
                passport.authenticate("local")(req, res, () => {
                    response.message = process.env.MSG_USER_LOGGED
                    response.code = 1
                    res.status(200).json(response)
                })
            }
        })
    })
})

// Facebook Strategy
router.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }))
router.get('/facebook/callback', 
    passport.authenticate(("facebook"),
        {failureRedirect: '/failure'}),
        (req, res) => {
            res.redirect('/auth/profile')
            console.log('SUCEES');      
        }
    )

// Github Strategy
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }))
router.get('/github/callback', 
    passport.authenticate(("github"),
        {failureRedirect: '/auth/failure'}),
        (req, res) => {
            res.redirect('/auth/profile')
            console.log('SUCCESS');      
        }
    )

router.get('/profile', (req, res) => {
    if(req.isAuthenticated()) {
        res.render("redirect")
    }else {
        res.send('You need to authenticate')
    }
    
})

router.get('/failure', (req, res) => {
    res.json({failure: 'Something happend'})
})


module.exports = router