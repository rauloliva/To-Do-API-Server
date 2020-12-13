const express = require('express')
const User = require('../models').user
const passport = require('passport')
const readResponseFile = require('./common/Common').readResponseFile
const { getPhoto } = require('./Utilities')
const objectId = require('./common/Common').objectId
const router = express.Router()

router.post('/register', /*uploabcryptd.single('photo'),*/ (req, res) => {
    readResponseFile( response => {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            token: req.sessionID,
            password: req.body.password
            //photo: [] //req.file.filename, req.file.originalname
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
                    response.data = user.token
                    res.status(201).json(response)
                })
            }
        })
    })
})

router.post('/login', (req, res) => {
    readResponseFile( async response => {
        const user = await User.findOne({username: req.body.username}).exec()

        req.logIn(user, err => {
            if(err) {
                response.message = `${process.env.MSG_SERVER_ERROR} ${err}`
                response.code = 0
                response.error = err
                res.status(200).json(response)
            } else {
                passport.authenticate("local")(req, res, async () => {
                    User.updateOne({_id: objectId(user._id)}, {token: req.sessionID}, (err, u) => {
                        response.message = process.env.MSG_USER_LOGGED
                        response.code = 1
                        response.data = req.sessionID   
                        res.status(200).json(response)
                    })
                })
            }
        })
    })
})

router.get('/user/:token', (req, res) => {
    readResponseFile( response => {
        const token = req.params.token
        User.findOne({token: token}, (err, user) => {
            getPhoto(user, u => {
                response.code = 1
                response.message = 'Returning User Authenticated'
                response.data = u
                res.status(200).json(response)
            })
        })
    })
})

// Facebook Strategy
router.get('/facebook', passport.authenticate('facebook', { scope : ['email'] }))
router.get('/facebook/callback', 
    passport.authenticate(("facebook"),
        {failureRedirect: '/failure'}),
        (req, res) => redirectOnSuccess(req, res)
    )

// Github Strategy
router.get('/github', passport.authenticate('github', { scope: [ 'user:email' ] }))
router.get('/github/callback', 
    passport.authenticate(("github"),
        {failureRedirect: '/auth/failure'}),
        (req, res) => redirectOnSuccess(req, res)
    )

// Twitter Strategy
router.get('/twitter', passport.authenticate('twitter'))
router.get('/twitter/callback', 
    passport.authenticate(("twitter"),
        {failureRedirect: '/auth/failure'}),
        (req, res) => redirectOnSuccess(req, res)
    )

// Google Strategy
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', 
    passport.authenticate(("google"),
        {failureRedirect: '/auth/failure'}),
        (req, res) => redirectOnSuccess(req, res)
    )

// Twitch Strategy
router.get('/twitch', passport.authenticate('twitchtv'))
router.get('/twitch/callback', 
    passport.authenticate(("twitch"),
        {failureRedirect: '/auth/failure'}),
        (req, res) => redirectOnSuccess(req, res)
    )

const redirectOnSuccess = (req, res) => res.redirect('/auth/redirect')

router.get('/redirect', (req, res) => {
    if(req.isAuthenticated()) {
        const token = req.user.token
        res.render("redirect", { token: token, uri: '/dashboard' })
    }else {
        res.send('You need to authenticate')
    }
})

router.get('/redirect/:token', (req, res) => {
    if(req.params.token) {
        const token = req.params.token
        res.render("redirect", { token: token, uri: '/dashboard' })
    }else {
        res.send('You need to authenticate')
    }
})

router.get('/failure', (req, res) => {
    res.json({failure: 'Something happend'})
})


module.exports = router