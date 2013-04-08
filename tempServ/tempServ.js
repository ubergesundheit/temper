var express = require('express');
var app = express();
var config = require('./config.json');


//var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
//var temps = null;
/*
var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
  var dbTemps = mongoClient.db('temps');
  temps = dbTemps.collection('temps');
*/

//express stuff..

app.get('/', function(req, res){
  res.send('/all	<-	get all data<br>'+
  '/now	<-	get current temperature<br>'+
  '/today	<-	get data of today<br>'+
  '/last_hour	<-	get data of last hour<br>'+
  '/graph 	<-	get graph with all data<br>'+
});


app.get('/files/:file', function(req, res){
    res.sendfile('files/'+req.params.file);
});

app.get('/graph', function(req, res){
    res.sendfile('files/graph.html');  
});


app.get('/all', function(req, res){
  temps.find({},{_id:false}).sort({ date: 1}).toArray(function(err, items) {
    res.json(items);
  });
});

app.get('/all_stream', function(req, res){
  var items = [];
  var stream = temps.find({},{_id:false}).sort({ date: 1}).stream();
  stream.on("data", function(item) {
    items.push(item);
  });
  stream.on("end", function() {
    res.json(items);
  });
});


app.get('/xy', function(req, res){
  var items = [];
  var stream = temps.find({},{_id:false}).sort({ date: 1}).stream();
  stream.on("data", function(item) {
    var obj = {};
    obj.x = Date.parse(item.date);
    obj.y = parseFloat(item.temperature);
    items.push(obj);
  });
  stream.on("end", function() {
    res.json(items);
  });
});


app.get('/now', function(req, res){
  temps.find({},{_id:false}).sort({date:-1}).limit(1).each(function(err, item) {
   res.json(item);
  });
});

app.get('/today', function(req, res){
  temps.find({$where: "this.date > new Date().setHours(0,0,0,0)"},{_id:false}).sort({ date: 1}).toArray(function(err, items) {
    res.json(items);
  });
});

app.get('/last_hour', function(req, res){
  temps.find({$where: "this.date > new Date().setHours(new Date().getHours(),0,0,0)"},{_id:false}).sort({ date: 1}).toArray(function(err, items) {
    res.json(items);
  });
});

  //mongoClient.close();
});

app.listen(3000);
