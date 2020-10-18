require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const multer = require('multer')
const session = require('express-session')
const passport = require('passport')
const upload = multer({dest: 'photos/'})
const [User, List, Item] = require('./DBModels/models')
const Lists = require('./routes/Lists')
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

app.use('/', (req, res) => {
    res.status(200).json({response: 'Welcome to my endpoint'})
})

app.use('/lists', Lists)

app.get('/help', (req, res) => {
    res.status(200)
    res.render('help')
})

app.post('/register', upload.single('photo'), (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        photo: [] //req.file.filename, req.file.originalname
    })
    const response = { res: null, status: 0 }
    
    User.register(newUser, newUser.password, (err, user) => {
        if(err) {
            res.status(201)
            res.json({error: err, status: 0, message: 'The user could not be created'})
        } else {
            passport.authenticate('local')(req, res, () => res.json({status: 200, message: 'User created', user: user}))
        }
    })
})

app.post('/login', (req, res) => {
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
            res.json({error: err})
        } else {
            passport.authenticate("local")(req, res, () => {
                res.json('User logged In')
            })
        }
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


//Handling 404 status
app.use((req, res) => {
    res.status(404)
       .json({error: 'Endpoint not found'})
})