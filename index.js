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
	res.end("<h1>Enter a url following the link to receive an Image Search Abstraction Layer!</h1><p>Example: https://lit-beach-37000.herokuapp.com/potato</p><p>To see recent searches, visit https://lit-beach-37000.herokuapp.com/searches");
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

	url = "https://www.googleapis.com/customsearch/v1?q=" + url + "&prettyPring=&cx=015005922836724402492%3Akioqjqy-8ny&searchType=image&key=AIzaSyDycjZFCjFYveh-zEy1e_rTmoTXT3kGYB8";
	request.get(url,
	 function(error, response, body){
	 	if (error) {
	 		throw error;
	 	}
	var result = JSON.parse(body); //!!! super important
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
