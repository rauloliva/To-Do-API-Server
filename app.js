require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const User = require('./DBModels/models').user
const Lists = require('./routes/Lists')
const Items = require('./routes/Items')
const Auth = require('./routes/Auth')
const Strategies = require('./Strategies/Strategies')
const app = express()
const port = process.env.PORT || 2000
process.env.NODE_ENV_URL = process.env.NODE_ENV === 'dev' ? `http://localhost:${port}` : ''

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

Strategies()

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