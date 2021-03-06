const passport = require('passport');
const User = require('../models').user;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const TwitchStrategy = require('passport-twitchtv').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy
const { validatePassword } = require('../routes/Utilities')
const env = process.env;

const Strategies = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: 'username' },
      (username, password, done) => {
        User.findOne({username: username}, (err, user) => {
          if(user) {
            validatePassword(password, user.password, (er, same) => {
                if(same) {
                  return done(null, user)
                } else {
                  return done(null, false)
                }
            })
          } else {
            return done(null, false)
          }
        })
      }
    )
  )

  passport.use(
    new FacebookStrategy(
      {
        clientID: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV_URL}${env.FACEBOOK_CALLBACK_URI}`,
        profileFields: ['id', 'displayName', 'photos', 'emails'],
      },
      (accessToken, refreshToken, profile, cb) => {
        const photo = `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`;
        let user = {
          facebookId: profile.id,
          username: profile.displayName,
          photo: { filename: photo },
          email: profile._json.email,
          token: accessToken,
          authLocally: false
        };

        findOrCreate({facebookId: user.facebookId}, user, (err, userReturned) => {
          return cb(err, userReturned)
        })
      }
    )
  );

  passport.use(
    new GithubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV_URL}${env.GITHUB_CALLBACK_URI}`,
      },
      (accessToken, refreshToken, profile, cb) => {
        let user = {
          githubId: profile.id,
          username: profile.displayName,
          photo: { filename: profile.photos[0].value },
          email: profile.emails[0].value,
          token: accessToken,
          authLocally: false
        };

        findOrCreate({githubId: user.githubId}, user, (err, userReturned) => {
          return cb(err, userReturned)
        })
      }
    )
  );

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: env.TWITTER_COSUMER_KEY,
        consumerSecret: env.TWITTER_CONSUMER_SECRET,
        callbackURL: `${env.NODE_ENV_URL}${env.TWITTER_CALLBACK_URI}`,
        userProfileURL:
          'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      },
      (accessToken, refreshToken, profile, cb) => {
        let user = {
          twitterId: profile.id,
          username: profile.username,
          photo: { filename: profile.photos[0].value },
          email: profile.emails[0].value,
          token: accessToken,
          authLocally: false
        };

        findOrCreate({twitterId: user.twitterId}, user, (err, userReturned) => {
          return cb(err, userReturned)
        })
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV_URL}${env.GOOGLE_CALLBACK_URI}`,
      },
      (accessToken, refreshToken, profile, cb) => {
        let user = {
          googleId: profile.id,
          username: profile.displayName,
          photo: { filename: profile.photos[0].value },
          email: profile._json.email,
          token: accessToken,
          authLocally: false
        };

        findOrCreate({googleId: user.googleId}, user, (err, userReturned) => {
          return cb(err, userReturned)
        })
      }
    )
  );

  passport.use(
    new TwitchStrategy(
      {
        clientID: env.TWITCH_CLIENT_ID,
        clientSecret: env.TWITCH_CLIENT_SECRET,
        callbackURL: `${env.NODE_ENV_URL}${env.TWITCH_CALLBACK_URI}`,
      },
      (accessToken, refreshToken, profile, cb) => {
        let user = {
          twitchId: profile.id,
          username: profile.username,
          photo: profile.photos[0].value,
          email: profile.emails[0].value,
          token: accessToken,
          authLocally: false
        };
        User.findOrCreate(user, (err, user) => {
          return cb(err, user);
        });
      }
    )
  );
};

const findOrCreate = (condition, user, cb) => {
  User.findOneAndUpdate(condition, user, (err, userUpdated) => {
    if(userUpdated) {
      return cb(err, userUpdated);
    } else {
      User.create(user).then( newUser => {
        return cb(err, newUser);
      })
    }
  })
}

module.exports = Strategies;
