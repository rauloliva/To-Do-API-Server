require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const [User, List, Item] = require('./DBModels/models')
const app = express()
const session = require('express-session')
const passport = require('passport')
const port = process.env.PORT || 3000

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

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const photo = req.photo
    res.json({
        usernam: username,
        password: password,
        email: email
    })
})

app.route('/lists')
    .get((req, res) => {
        const response = { res: null, status: 0 }
        List.find({}, (err, lists) => {
            if(err) {
                response.status = 500
            } else {
                response.res = lists
                response.status = 200
            }
            res.json(response)
        })
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
