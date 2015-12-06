var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//var MONGODBURL = 'mongodb://localhost:27017/test';
var MONGODBURL = 'mongodb://smegkim:Ss_123456@ds054298.mongolab.com:54298/mongodbjgy/test'
var mongoose = require('mongoose');

function findCriteria(array){
	var criteria = {};
	var pair = {};	
	for(var i=0;i<array.length;i=i+2){
			if(array[i]=="date"||array[i]=="grade"||array[i]=="score"){
				pair[array[i]] = array[i+1];
				criteria['grades'] = {$elemMatch:pair};		
			}else if(array[i]=="street"||array[i]=="zipcode"||array[i]=="building"){
				criteria["address."+array[i]] = array[i+1];
			}else if(array[i]=="lon"||array[i]=="lat"){
				if(array[i]=="lon"){
					criteria['address.coord.0'] = array[i+1];
				}else{
					criteria['address.coord.1'] = array[i+1];
				}
			}else{
				criteria[array[i]] = array[i+1];		
			}		
		}
	return criteria;
}

function updateCriteria(array){
	var criteria = {};
	var pair = {};	
	for(var i=0;i<array.length;i=i+2){
			if(array[i]=="date"||array[i]=="grade"||array[i]=="score"){
				//pair[array[i]] = array[i+1];
				//criteria['grades.0'] = {$set:pair};	
				criteria['grades.0.'+array[i]]=array[i+1];		
			}else if(array[i]=="street"||array[i]=="zipcode"||array[i]=="building"){
				criteria["address."+array[i]] = array[i+1];
			}else if(array[i]=="lon"||array[i]=="lat"){
				if(array[i]=="lon"){
					criteria['address.coord.0'] = array[i+1];
				}else{
					criteria['address.coord.1'] = array[i+1];
				}
			}else{
				criteria[array[i]] = array[i+1];		
			}		
		}
	return criteria;
}


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
if(req.body.date&&req.body.grade&&req.body.score){
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
}
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		var r = new Restaurant(rObj);
		//console.log(r);
		r.save(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err;
			}
       		//console.log('Restaurant created!')
       		db.close();
			res.status(200).json({message: 'insert done', restaurant_id: r.restaurant_id});
    	});
    });
});

app.delete('/restaurant/*',function(req,res) {
	var path = req.path.trim();
	if(path.lastIndexOf('/')==req.path.length-1){		
		path = path.slice(12,req.path.length-1);
	}else{
		path = path.slice(12,req.path.length);
	}
	var array = path.split('/');
	
	if(array.length%2!=0){
		res.status(200).json({message: 'Number of fields do not match number of values '});
	}else{	
		var criteria = findCriteria(array);
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
	    	});//end of db open
	}//end of else
});

//request all docs
app.get('/restaurant', function(req,res) {
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

//request docs with criteria
app.get('/restaurant/*', function(req,res) {
	var path = req.path.trim();
	if(path.lastIndexOf('/')==req.path.length-1){		
		path = path.slice(12,req.path.length-1);
	}else{
		path = path.slice(12,req.path.length);
	}
	var array = path.split('/');
	
	if(array.length%2!=0){
		res.status(200).json({message: 'Number of fields do not match number of values '});
	}else{
		var criteria = findCriteria(array);
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
	    	});//end of db open
	}//end of else
});


//update any information of any restaurants
//body specifing update informations
//path collecting target requirement
app.put('/criteria/*', function(req,res) {
	//handling path
	var path = req.path.trim();
	if(path.lastIndexOf('/')==req.path.length-1){		
		path = path.slice(10,req.path.length-1);
	}else{
		path = path.slice(10,req.path.length);
	}
	var array_path = path.split('/');	

	//handling body
	var raw_request_body = JSON.stringify(req.body);
	var request_body = raw_request_body.slice(1,raw_request_body.length-1).split('\"').join('');
	var array_body = request_body.split(/\,|\:/);
	
	
	if(array_body.length%2!=0&&array_path.length%2!=0){
		res.status(200).json({message: 'Number of fields do not match number of values '});
	}else{	
		var target_criteria = findCriteria(array_path);
		var update_info = updateCriteria(array_body);
		console.log(update_info);
		var restaurantSchema = require('./models/restaurant');
		mongoose.connect(MONGODBURL);
		var db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function (callback) {
			var Restaurant = mongoose.model('Restaurant', restaurantSchema);
			Restaurant.update(target_criteria,{$set:update_info},function(err,results){
	       			if (err) {
					res.status(500).json(err);
					//throw err;
				}
				else {	
					res.status(200).json({message: 'update done'});
				}
				db.close();
	    		});
	    	});//end of db open
	}//end of else
});


//push a grade to a restaurant
app.put('/:restaurant_id/grade', function(req,res) {
	var gradeObj = {};
	gradeObj["date"]=req.body.date;
	gradeObj["grade"]=req.body.grade;
	gradeObj["score"]=req.body.score;
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
