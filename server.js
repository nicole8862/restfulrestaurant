var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//var MONGODBURL = 'mongodb://localhost:27017/test';
var MONGODBURL = 'mongodb://smegkim:Ss_123456@ds054298.mongolab.com:54298/mongodbjgy/test'
var mongoose = require('mongoose');

app.post('/',function(req,res) {
	//console.log(req.body);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var rObj = {};
		rObj.address = {};
		rObj.address.building = req.body.building;
		rObj.address.street = req.body.street;
		rObj.address.zipcode = req.body.zipcode;
		rObj.address.coord = [];
		rObj.address.coord.push(req.body.lon);
		rObj.address.coord.push(req.body.lat);
		rObj.borough = req.body.borough;
		rObj.cuisine = req.body.cuisine;
		rObj.name = req.body.name;
		rObj.restaurant_id = req.body.restaurant_id;
		//ADD GRADES
		rObj.grades=[];
		//rObj.grades.push({'date':req.body.date[i],'grade':req.body.grade[i],'score':req.body.score[i]});
		
//curl -X POST localhost:8099 --data "name=xxx&building=xxx&street=xxx&zipcode=xxx&lon=100&lat=100&borough=xxx&cuisine=xxx&restaurant_id=x&date=1&grade=2&score=3&restaurant_id=x&date=11&grade=12&score=13"

		if ((req.body.date.length==req.body.grade.length)&&(req.body.grade.length==req.body.score.length)&&req.body.grade.length>1) {
			for(var i=0; i< req.body.date.length; i++){
				var date = req.body.date[i];
				var grade = req.body.grade[i];
				var score = req.body.score[i];	
				rObj.grades.push({'date':date,'grade':grade,'score':score});
				//console.log(req.body.grades[i]);
			}
		}
		else if(req.body.date&&req.body.grade&&req.body.score){
			rObj.grades.push({'date':req.body.date,'grade':req.body.grade,'score':req.body.score});
		}
		else{
			rObj.grades=[];		
		}

		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		var r = new Restaurant(rObj);
		//console.log(r);
		r.save(function(err) {
       		if (err) {
				res.status(500).json(err);
				//throw err;
			}
       		//console.log('Restaurant created!')
       		db.close();
			res.status(200).json({message: 'insert done', restaurant_id: r._id});
    	});
    });
});

app.delete('/:field/:value',function(req,res) {
	var criteria = {};
	criteria[req.params.field] = req.params.value;
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria).remove(function(err) {
       		if (err) {
				res.status(500).json(err);
				//throw err
			}
       		//console.log('Restaurant removed!')
       		db.close();
			res.status(200).json({message: 'delete done'});
    	});
    });
});

//request all docs
app.get('/', function(req,res) {
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    	});
    });
});

app.get('/:field/:value', function(req,res) {
	var criteria = {};
	criteria[req.params.field] = req.params.value;	
	//criteria["field"]="value";
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    	});
    });
});

//2 criteria
app.get('/:field1/:value1/:field2/:value2', function(req,res) {
	var criteria = {};
	criteria[req.params.field1] = req.params.value1;
	criteria[req.params.field2] = req.params.value2;	
	//criteria["field"]="value";
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    	});
    });
});

app.get('/address/:field/:value', function(req,res) {
	var criteria = {};
	
	criteria["address."+req.params.field] = req.params.value;
	
	//criteria["field"]="value";
	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    	});
    });
});

app.get('/address/coord/:x/:y', function(req,res) {
	var x = Number(req.params.x);
	var y = Number(req.params.y);
	var coordArray = [x,y];
	var criteria = {};
	criteria["address.coord"] = coordArray;

	//criteria["field"]="value";
	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
    	});
    });
});

app.get('/grades/:field/:value', function(req,res) {
	var criteria = {};
	var gradeObj = {};
	gradeObj[req.params.field]=req.params.value;
	criteria["grades"] = {$elemMatch: gradeObj};

	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				//throw err;
			}
			if (results.length > 0) {
				res.status(200).json(results);
			}
			else {	
				res.status(200).json({message: 'No matching document',});
			}
			db.close();
    	});
    });
});

app.put('/:restaurant_id/:field/:value', function(req,res) {
	
	var criteria = {};	
	criteria[req.params.field] = req.params.value;
	
	
	//criteria["field"]="value";
	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.update({restaurant_id:req.params.restaurant_id},{$set:criteria},function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			else {	
				res.status(200).json({message: 'update done'});
			}
			db.close();
    		});
    });
});

app.put('/:restaurant_id/address/:field/:value', function(req,res) {
	var criteria = {};
	
	criteria[req.params.field] = req.params.value;
	
	
	//criteria["field"]="value";
	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.update({restaurant_id:req.params.restaurant_id},{$set:{address:criteria}},function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			else {	
				res.status(200).json({message: 'update done'});
			}
			db.close();
    	});
    });
});

app.put('/:restaurant_id/address/coord/:x/:y', function(req,res) {
	var criteria = {};
	var x = Number(req.params.x);
	var y = Number(req.params.y);
	var coordArray = [x,y];
	criteria["address.coord"] = coordArray;
	
	//criteria["field"]="value";
	console.log(criteria);
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.update({restaurant_id:req.params.restaurant_id},{$set:criteria},function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			else {	
				res.status(200).json({message: 'update done'});
			}
			db.close();
    	});
    });
});

//push a grade to a restaurant
app.put('/:restaurant_id/:date/:grade/:score', function(req,res) {
	var gradeObj = {};
	gradeObj["date"]=req.params.date;
	gradeObj["grade"]=req.params.grade;
	gradeObj["score"]=req.params.score;
	var restaurantSchema = require('./models/restaurant');
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.update({restaurant_id:req.params.restaurant_id},{$push: {grades: gradeObj}},function(err,results){
       			if (err) {
				res.status(500).json(err);
				//throw err;
			}
			else {	
				res.status(200).json({message: 'update done'});
			}
			db.close();
    		});
    });
});

app.listen(process.env.PORT || 8099);
