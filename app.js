require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const Models = require('./DBModels/models')
const User = Models.user
const List = Models.list
const Item = Models.item
const Lists = require('./routes/Lists')
const Auth = require('./routes/Auth')
const app = express()
const port = process.env.PORT || 3000

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

app.listen(port, () => console.log(`The Server started at port ${port}`))

app.use('/lists', Lists)

app.use('/auth', Auth)

app.get('/help', (req, res) => {
    res.status(200)
    res.render('help')
})

app.get('/create', (req, res) => {
    const user = new User({
        username: 'Carlos123',
        password: '123',
        email: 'carlos.raul@gmail.com',
        photo: ''
    })

    user.save()

    //save the item
    const item = new Item({
        task: "Do my homework",
        isDone: false
    })

    item.save()

    const list = new List({
        name: "Daily Tasks",
        user: user.id,
        items: [item.id]
    })
    
    list.save()

    res.json({status: 'success'})
})

app.use('/', (req, res) => res.redirect('/help'))

//Handling 404 status
app.use((req, res) => {
    res.status(404)
       .json({error: 'Endpoint not found'})
})