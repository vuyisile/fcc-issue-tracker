/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      console.log('query',req.query);
      var query = req.query;
      if (query._id) { query._id = new ObjectId(query._id)}
      if (query.open) { query.open = String(query.open) == "true" }
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var collection = db.collection(project);
        collection.find(query).toArray(function(err,docs){res.json(docs)});
      });
      
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue = {...req.body,created_on:new Date(),updated_on:new Date()}
      console.log('issue',issue);
      if(issue.issue_title.length <= 0 || issue.issue_text.length <= 0 || issue.created_by.length <= 0){
      res.send('please enter missing text!');
      }else{
         MongoClient.connect(CONNECTION_STRING, function(err, db) {
          var collection = db.collection(project);
          collection.insertOne(issue,function(err,doc){
            issue._id = doc.insertedId;
            res.json(issue);
          });
        });
      }
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var newRecords= req.body;
      var id = req.body._id
      delete newRecords._id;
      console.log('update',newRecords)
   
          if (newRecords.open) { newRecords.open = String(newRecords.open) == "true" }
      newRecords.updated_on = new Date();
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
            var data = db.collection(project);
            data.findOneAndUpdate({ "_id": new ObjectId(id)}, {$set: {...newRecords}}, {new: true},function(err,doc) {
             if (err) { throw err; }
             else { console.log("Updated"); }
           }); 
      });   
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var query = req.query;
      var issue = req.body._id;
      var records = req.body;
       MongoClient.connect(CONNECTION_STRING, function(err, db) {
            var data = db.collection(project);
            data.findOneAndRemove({ "_id": new ObjectId(issue)}, function(err,doc) {
             if (err) { res.send('could not delete '+issue+' '+err)}
             else { 
               res.send('deleted '+issue); console.log("Record Deleted"); 
                  }
           }); 
      });  
   });  
};
