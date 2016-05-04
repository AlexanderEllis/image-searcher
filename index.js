var http = require('http');
var request = require('request');
var express = require('express');
var app = express();
var url;
var searchHistory = [];
var resultObject = {
	url: "",
	altText: "",
	pageURL: ""
}

app.get('/', function(req, res) {
	res.end("<h1>Enter a search term following the link</h1><p>Example: https://lit-beach-37000.herokuapp.com/potato</p><To paginate through the results, add ?offset=n with your desired offset.  Example: https://lit-beach-37000.herokuapp.com/potato?offset=1</p><p>To see recent searches, visit https://lit-beach-37000.herokuapp.com/searches</p>");
});

app.get('/searches', function(req,res) {
	var searchInfo = JSON.stringify(searchHistory);
	res.end(searchInfo);
});

app.get('/*', function(req, res) {
	var resultArr = [];
	var offset = req.query.offset;
	res.setHeader('Content-Type', 'application/json');
	url = req.url;
	
	if (url.indexOf("?offset") > 1) {
		url = url.slice(1, url.indexOf("?offset"));
	}
	else {
		url = url.slice(1, url.length);
	}

	var history = {};
	history.term = url;
	history.timestamp = new Date(((new Date()).getTime()));
	searchHistory.push(history);

	url = "https://www.googleapis.com/customsearch/v1?q=" + url + "&prettyPring=&cx=015005922836724402492%3Akioqjqy-8ny&searchType=image&key=" + process.env.GOOG_API_KEY;
	request.get(url,
	 function(error, response, body){
	 	if (error) {
	 		throw error;
	 		return;
	 	}
	var result = JSON.parse(body); //important!

	if (result.error) {
		res.end(result.error.message);
		return;
	}

	result = result.items;
	for (i = 0; i < result.length; i++) {
		resultObject = {url: "",altText: "",pageURL: ""} //reset resultObject
		resultObject.url = result[i].link;
		resultObject.altText = result[i].title;
		resultObject.pageURL = result[i].image.contextLink;
		resultArr.push(resultObject);
	}
	if (offset > 0) {
		var lostArr = resultArr.slice(0, offset);
		resultArr = resultArr.slice(offset, resultArr.length).concat(lostArr);
	}
	resultArr = JSON.stringify(resultArr);
	res.end(resultArr);
});
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log("Listening at:" + port);
});
