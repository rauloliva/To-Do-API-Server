const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
    photo: Object,
    token: String,
    authLocally: Boolean,
    googleId: String,
    facebookId: String,
    linkedinId: String,
    githubId: String,
    twitterId: String,
    twitchId: String,
    createdDate: String,
    lastLogged: String,
  },
  { timestamps: true }
);

const listSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    user: mongoose.Schema.Types.ObjectId,
    items: Array,
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    task: String,
    isDone: Boolean,
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose);
listSchema.plugin(passportLocalMongoose);
itemSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);
listSchema.plugin(findOrCreate);
itemSchema.plugin(findOrCreate);

module.exports = {
  user: mongoose.model('user', userSchema),
  list: mongoose.model('list', listSchema),
  item: mongoose.model('item', itemSchema),
};
