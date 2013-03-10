var express = require('express');
var http = require('http');
var app = express();
var MongoClient = require('mongodb').MongoClient, Server = require('mongodb').Server;
var temps = null;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
  var dbTemps = mongoClient.db('temps');
  temps = dbTemps.collection('temps');


//express stuff..
app.get('/', function(req, res){
  res.send('/all	<-	get all data<br>'+
  '/now	<-	get current temperature<br>'+
  '/today	<-	get data of today<br>'+
  '/last_hour	<-	get data of last hour<br>'+
  '/graph 	<-	get graph with all data<br>'+
  '/licht	<-	switch light on/off');
});

app.get('/files/:file', function(req, res){
    res.sendfile('files/'+req.params.file);
});

app.get('/graph', function(req, res){
    res.sendfile('files/graph.html');  
});

app.get('/licht', function(req, res){
    var post = http.request({ host: '192.168.178.235', port: '80', path: '/leds.cgi?led=1', method: 'POST'}, function (res) {});
    post.end();
    var get = http.get({ host: '192.168.178.235', port: '80', path: '/status.xml'}, function(getres) { 
	var xmlresponse = '';
	  getres.on('data', function (chunk) {
	    xmlresponse += chunk;
          });
	  getres.on('end', function(){
	    res.set('Content-Type', 'text/plain');
	    res.send(xmlresponse.substr(12,14));
	  });
    });
    //res.send('success');
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
