require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const User = require('./models').user
const Lists = require('./routes/Lists')
const Items = require('./routes/Items')
const Auth = require('./routes/Auth')
const UserRouter = require('./routes/User')
const Strategies = require('./Strategies/Strategies')
const readResponseFile = require('./routes/common/Common').readResponseFile
const app = express()
const port = process.env.PORT || 2000
process.env.NODE_ENV_URL = process.env.NODE_ENV === 'dev' ? `http://localhost:${port}` : ''

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/views'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(session({
    secret: 'secretsession',
    resave: false,
    saveUninitialized: false,
}))
passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

// Defining the strategies
Strategies()

app.listen(port, () => console.log(`The Server started at port ${port}`))

app.use('/lists', Lists)

app.use('/items', Items)

app.use('/auth', Auth)

app.use('/user', UserRouter)

app.get('/logout/:token', (req, res) => {
    const token = req.params.token
    readResponseFile( response => {
        User.updateOne({token: token}, {token: ''}, (...args) => {
            response.code = 1
            response.message = 'User logged out'
            res.status(200).json(response)
        })
    })
})

app.get('/help', (req, res) => res.status(200).render('help'))

app.use('/', (req, res) => res.redirect('/help'))