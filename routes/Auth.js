const express = require('express')
const User = require('../models').user
const passport = require('passport')
const readResponseFile = require('./common/Common').readResponseFile
const readResponse = require('./common/Common').readResponse
const { getPhoto } = require('./Utilities')
const objectId = require('./common/Common').objectId
const router = express.Router()
const log = require('../logs/Log')
const { generateHash } = require('./Utilities')

router.post('/register', (req, res) => {
    if(readResponse.code === 0) {
        generateHash(req.body.password, (hash) => {
            const user = new User({
                username: req.body.username,
                email: req.body.email,
                token: req.sessionID,
                password: hash,
                authLocally: true
            })

            User.findOne({username: req.body.username}, (err, userFound) => {
                if(userFound) {
                    readResponse.code = -1 
                    res.json(readResponse)
                } else {
                    user.save((err, d) => {
                        readResponse.code = 1
                        readResponse.data = user.token
                        res.json(readResponse)
                    })
                }
            })
        })            
    } else {
        res.json(readResponse)
    }
})

// Local Strategy
router.post('/login', (req, res) => {
    readResponseFile( response => {
        passport.authenticate("local")(req, res, (...args) => {
            User.findOne({username: req.body.username}, (err, user) => {
                User.updateOne({_id: objectId(user._id)}, {token: req.sessionID}, (err, u) => {
                    response.code = 1
                    response.data = req.sessionID   
                    res.status(200).json(response)
                })
            })
        })
    })
})  

router.get('/clear', (req, res) => {
    readResponse.code = 0
    readResponse.data = null
    readResponse.message = ''
    res.status(200).json({message: 'Server: respone object is clean'})
})

router.get('/user/:token', (req, res) => {
    readResponseFile( response => {
        const token = req.params.token
        User.findOne({token: token}, (err, user) => {            
            getPhoto(user, u => {
                response.code = 1
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
        log('You need to authenticate')
        res.send('You need to authenticate')
    }
})

// redirect for local strategy
router.get('/redirect/local/:token', (req, res) => {
    const token = req.params.token
    if(token !== '' && token !== undefined) {
        res.render("redirect", { token: token, uri: '/dashboard' })
    }else {
        log('You need to authenticate')
        res.send('You need to authenticate please!!')
    }
})

router.get('/failure', (req, res) => {
    res.json({failure: 'Something happend'})
})


module.exports = router