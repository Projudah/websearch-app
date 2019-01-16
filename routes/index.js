var express = require('express');
var router = express.Router();
const request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Toronto Waste Lookup' });
});

router.post('/', function(req, res, next) {
	request.get("https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var data = JSON.parse(body);
			search(req.body.search, data, function(hits){
				console.log(hits);
				res.render('index', { title: 'Toronto Waste Lookup' });
			});
		}
	});
});

function search(searchterm, data,callback){
	var terms = searchterm.split(" ");
	var hits = [];

	for(var elem=0; elem < data.length; elem++){
		keyword = data[elem].keywords.split(" ");
		for(var term=0; term< terms.length; term++){
			if(keyword.includes(terms[term])){
				hits.push(data[elem])
			}
		}
	}

	callback(hits)
}

module.exports = router;
