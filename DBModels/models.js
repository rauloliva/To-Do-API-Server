const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const findOrCreate = require('mongoose-findorcreate')

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
    token: String,
    googleId: String,
    facebookId: String,
    linkedinId: String,
    githubId: String,
    twitterId: String,
    twitchId: String
}, { timestamps: true })

const listSchema = new mongoose.Schema({
    name: String,
    description: String,
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

userSchema.plugin(findOrCreate)
listSchema.plugin(findOrCreate)
itemSchema.plugin(findOrCreate)

module.exports = {
    user: mongoose.model('user', userSchema),
    list: mongoose.model('list', listSchema),
    item: mongoose.model('item', itemSchema)
}