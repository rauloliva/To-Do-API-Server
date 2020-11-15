require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const User = require('./DBModels/models').user
const Lists = require('./routes/Lists')
const Items = require('./routes/Items')
const Auth = require('./routes/Auth')
const FacebookStrategy = require('passport-facebook').Strategy
const GithubStrategy = require('passport-github2').Strategy
const app = express()
const port = process.env.PORT || 2000

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(User.createStrategy())
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:2000/auth/facebook/callback',
        profileFields: ['id','displayName', 'photos', 'emails'],
        // passReqToCallback: true,
    },
    (accessToken, refreshToken, profile, cb) => {
        const photo = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`
        let user = {
            facebookId: profile.id, 
            username: profile.displayName,
            photo: photo,
            email: profile._json.email
        }
        User.findOrCreate(user, (err, user) => {
            return cb(err, user)    
        })
    }
))

passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://localhost:2000/auth/github/callback'
        // profileFields: ['id','displayName', 'photos', 'emails'],
    },
    (accessToken, refreshToken, profile, cb) => {
        console.log("Github Profile");
        console.log(profile);
        let user = {
            githubId: profile.id, 
            username: profile.displayName,
            photo: profile.photos[0].value,
            email: profile.emails[0].value
        }
        User.findOrCreate(user, (err, user) => {
            return cb(err, user)    
        })
    }
))

app.listen(port, () => console.log(`The Server started at port ${port}`))

app.use('/lists', Lists)

app.use('/items', Items)

app.use('/auth', Auth)

app.get('/help', (req, res) => {
    res.status(200)
    res.render('help')
})

app.use('/', (req, res) => res.redirect('/help'))

//Handling 404 status
app.use((req, res) => {
    res.status(404)
       .json({error: 'Endpoint not found'})
})