const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

mongoose.connect('mongodb://localhost:27017/ToDoApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set('useCreateIndex', true)

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    photo: String,
    googleId: String,
    facebookId: String,
    linkedinId: String
}, { timestamps: true })

const listSchema = new mongoose.Schema({
    name: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    items: {
        type: mongoose.Schema.Types.Array
    }
}, { timestamps: true })

const itemSchema = new mongoose.Schema({
    task: String,
    isDone: Boolean
}, { timestamps: true })

userSchema.plugin(passportLocalMongoose)
listSchema.plugin(passportLocalMongoose)
itemSchema.plugin(passportLocalMongoose)

module.exports = [
    mongoose.model('user', userSchema),
    mongoose.model('list', listSchema),
    mongoose.model('item', itemSchema)
]