const passport = require('passport')
const User = require('../DBModels/models').user
const FacebookStrategy = require('passport-facebook').Strategy
const GithubStrategy = require('passport-github2').Strategy
const TwitterStrategy = require('passport-twitter').Strategy

const Strategies = () => {
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
    
    passport.use(new TwitterStrategy({
            consumerKey: process.env.TWITTER_COSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: 'http://localhost:2000/auth/twitter/callback',
            userProfileURL  : 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true'
        },
        (accessToken, refreshToken, profile, cb) => {
            let user = {
                twitterId: profile.id, 
                username: profile.username,
                photo: profile.photos[0].value,
                email: profile.emails[0].value
            }
            User.findOrCreate(user, (err, user) => {
                return cb(err, user)    
            })
        }
    ))
}


module.exports = Strategies