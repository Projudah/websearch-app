var express = require('express');
var router = express.Router();
const request = require('request');
var decode = require('decode-html');
var fs = require('fs');
const favs_path = 'public/favourites/favs.txt'

/* GET home page. */
router.get('/', function(req, res, next) {
	req.app.locals.decode = decode;
	get_favs(function(favs){
		res.render('index', { title: 'Toronto Waste Lookup', favs: favs});
	});
});

router.post('/', function(req, res, next) {
	req.app.locals.decode = decode;

	request.get("https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			search(req.body.search, data, function(hits){
				get_favs(function(favs){
					res.render('index', { title: 'Toronto Waste Lookup', hits: hits, body: req.body, favs: favs});
				});
			});
		}
	});
});

router.post('/favourite', function(req, res, next) {
	console.log("NEW:", req.body.new);
	console.log("SPLIT:", req.body.new.split('\n'))

	var data = JSON.parse(req.body.new.split('\n').join('\\n'));
	var data_id = req.body.id;
	fs.readFile(favs_path, function(err,saved){
		if(!err){
			var list ={}
			if(saved != 'empty'){
				list = JSON.parse(saved);
			}
			if(data_id in list){
				delete list[data_id];
				if(list == {})
					list = 'empty';
			}else{
				list[data_id] = data[data_id];
			}
			fs.writeFile(favs_path, JSON.stringify(list),function(err){
				if(!err){
					console.log("SAVED")
					res.redirect('/');
				}else{
					throw err
				}
			})
		}else{
			throw err;
		}
	})
});

function search(searchterm, data,callback){
	var terms = searchterm.split(" ");
	var hits = {};

	for(var elem=0; elem < data.length; elem++){
		keyword = data[elem].keywords.split(" ");
		for(var term=0; term< terms.length; term++){
			if(keyword.includes(terms[term])){
				// data[elem].body = decode(data[elem].body);
				if(!('id' in data[elem])){
					data[elem].id = data[elem].title;
				}
				hits[data[elem].id] = data[elem];
			}
		}
	}

	callback(hits)
}

function get_favs(callback){
	var list ="empty";
	try {
		if (fs.existsSync(favs_path)) {
			fs.readFile(favs_path, function(err,data){
				if(!err){
					if(data!='empty')
						list = JSON.parse(data);
				}
				callback(list);
			});
		}else{
			console.log('filedoes not exist')
			fs.appendFile(favs_path, list, function(err){
				if(err)
					throw err
				callback(list);
			});
		}
	} catch(err) {
		console.error(err)
		throw err
		callback(list)
	}
}

module.exports = router;
