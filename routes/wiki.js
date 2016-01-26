'use strict';
var express = require('express');
var router = express.Router();
var Page = require('../models/').Page;
var User = require('../models/').User;

module.exports = router;

router.get("/", function(req,res,next){
  //display all pages in the database
  Page.find()
  .then(function(allTitles) {
    res.render('index', 
      {titles: allTitles}
    )
  })
  // res.redirect('/');
});

router.get("/add", function(req,res,next) {
  res.render('addpage');
});

router.get("/:urlTitle", function(req,res,next) {
  //lookup page based on urlTitle
  Page.findOne({urlTitle: req.params.urlTitle})
  .then(function(urlPage) { //.then is an alias for .exec().then
    res.render('wikipage', {
      title: urlPage.title,
      urlTitle: urlPage.urlTitle,
      content: urlPage.content,
      author: urlPage.author
    });
  }, function(err) {
    res.render('error', err);
  })
});

router.post("/", function(req,res,next) {
  //from the addpage submit button
  // console.log(req.body.pageContent);
  var page = new Page ({
  	title: req.body.title,
  	content: req.body.pageContent
  });

  page.save()
  .then(function(savedPage){
    //if the save works then show the object  
    console.log(savedPage);
    res.redirect(savedPage.route);
  }, function(err) {
    //if there is an error, redirect to the error page
    res.render('error', err);
  });
});

