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
  content:   {type: String, required: true}, //these validations are built into mongoose and not mongoDB
  status:    {type: String, enum: statuses},
  tags:    {type: [String]}, 
  date:     {type: Date, default: Date.now}, //don't invoke Date.now b/c if we did it woul register as soon as our app boots
  author:   {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

//the schema defines the model, which is why this is defined on the schema
//virtual means it is defined on the schema virtually, not literally like the fields above
//for virtuals, 'this' refers to the instance this was called upon (this is not true for statics)
//this is a method, not a static variable; you can not call and invoke [can't page.route()]
pageSchema.virtual('route').get(function () { 
  return '/wiki/' + this.urlTitle;
});
//if json is used; json stringify passes a string and then the browser renders it as an object -- this will not render the virtuals by default


//hooks like below, modify the document before or after the event. Also called MiddleWare
//pre.save is post.validate, so make sure to put your hook in the right spot
pageSchema.pre('validate', function(next){
  var self = this;
  //create urlTitle
  if (self.title) {
    self.urlTitle = self.title.replace(/\s+/g, "_").replace(/\W/g, '');
  } else {
    //if title doesn't exist then create a random URL
    self.urlTitle = Math.random().toString(36).substring(2, 7); 
  }
  next(); //move on to the next save middleware
});

//method on the collection as a whole
//statics are not like prototype methods, the methods are like prototype methods
//this method is to be performed on many different documents not just one document. To use you do Page.findByTag not p.findByTag -- you call it from the constructor

pageSchema.statics.findByTag = function(tag){
  //!! Note that in statics this === Page !!
  //alternate in keyword   
  // Page.find({
  //   // $in matches a set of possibilities
  //   tags: {$in: []}
  // });
  return this.find({ tags: {$elemMatch: { $eq: tag } } }).exec();
};

pageSchema.statics.findByTag = function(tag){
  //!! Note that in statics this === Page !!
  //alternate in keyword   
  // Page.find({
  //   // $in matches a set of possibilities
  //   tags: {$in: []}
  // });
  return this.find({ tags: {$elemMatch: { $eq: tag } } }).exec();
};

//p.findSimilar() -- works and the context of findSimilar is the object p
pageSchema.methods.findSimilar = function(){
  //Page is the entire collection here; this is the specific url sent in
  return Page.find({
    // $in matches a set of possibilities
    tags: {$in: this.tags},
    _id: {$ne: this._id} //$ne is not equal in mongo
  }).exec();
};

var userSchema = new mongoose.Schema({
  name:  {type: String, required: true},
  email:  {type: String, required: true, unique: true}
});

var Page = mongoose.model('Page', pageSchema); //new collection in db called Page
var User = mongoose.model('User', userSchema);

module.exports = {
  Page: Page,
  User: User
};

