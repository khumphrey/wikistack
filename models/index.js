var mongoose = require('mongoose');
// var page = require('./page');
// Notice the `mongodb` protocol; Mongo is basically a kind of server,
// which handles database requests and sends responses. It's async!
mongoose.connect('mongodb://localhost/wikistack'); // <= db name will be 'wikistack'
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb connection error:'));
var statuses = ['open', 'closed'];
var pageSchema = new mongoose.Schema({
  title:    {type: String, required: true},
  urlTitle:  {type: String, required: true},
  content:   {type: String, required: true},
  status:    {type: String, enum: statuses},
  date:     {type: Date, default: Date.now}, //don't invoke Date.now b/c if we did it woul register as soon as our app boots
  author:   {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

pageSchema.pre('validate', function(next){
  var self = this;
  if (self.title) {
    self.urlTitle = self.title.replace(/\s+/g, "_").replace(/\W/g, '');
  } else {
    //if title doesn't exist then create a random URL
    self.urlTitle = Math.random().toString(36).substring(2, 7); 
  }
  next(); //move on to the next save middleware
});

pageSchema.virtual('route').get(function () {
  return '/wiki/' + this.urlTitle;
});

var userSchema = new mongoose.Schema({
  name:  {type: String, required: true},
  email:  {type: String, required: true, unique: true}
});

var Page = mongoose.model('Page', pageSchema);
var User = mongoose.model('User', userSchema);



module.exports = {
  Page: Page,
  User: User
};

