'use strict';
var express = require('express');
var router = express.Router();
var Page = require('../models').Page;
var User = require('../models').User;

module.exports = router;

router.get("/", function(req,res,next){
  //display all pages in the database
  Page.find({}) //{} is query parameters to find; empty means all
  .then(function(allTitles) {
    res.render('index', 
      {titles: allTitles}
    )
  }, function(err) {
    res.render('error', err);
  })
  // res.redirect('/');
});

router.get("/add", function(req,res,next) {
  res.render('addpage');
});

router.get('/search', function(req,res,next) {
  //req.query
  //spit out list of applicable titles
  
  Page.findByTag(req.query.tagSearch)
    .then(function(pages) {
      res.render('index', {
        titles: pages
      })
    }, function(err) {
      res.render('error', err);
    });
});

router.get("/:urlTitle", function(req,res,next) {
  //lookup page based on urlTitle
  //Mongoose where statement
  Page.findOne({urlTitle: req.params.urlTitle})
  .then(function(urlPage) { //.then is an alias for .exec().then
    res.render('wikipage', {
      title: urlPage.title,
      urlTitle: urlPage.urlTitle,
      content: urlPage.content,
      tags: urlPage.tags.join(", "),
      author: urlPage.author
    });
  }, function(err) {
    res.render('error', err);
  })
});


router.get("/:urlTitle/similar", function(req,res,next) {
  //this is not working quite right...!

  //Mongoose where statement
  Page.findOne({urlTitle: req.params.urlTitle})
    .then(function(urlPage) { //.then is an alias for .exec().then
      return urlPage.findSimilar();
    })
    .then(function(urlPages) {
      console.log("I found the similar ones!")
      res.render('index', {
        titles: urlPages 
      })
    })
    .then(null, function(err) {
      res.render('error', err);
    })
});


router.post("/", function(req,res,next) {
  //from the addpage submit button
  // console.log(req.body.pageContent)
  var page = new Page ({
  	title: req.body.title,
  	content: req.body.pageContent,
    status: req.body.pageStatus,
    tags: req.body.tags.split(",")
  });

  //want to make sure the user doesn't already exist based on unique email
  var user = new User ({
    name: req.body.authorName,
    email: req.body.authorEmail
  });

  page.save()
  .then(function(savedPage){
    //if the save works then show the object
    res.redirect(savedPage.route);
  }, function(err) {
    //if there is an error, redirect to the error page
    res.render('error', err);
  });
});

