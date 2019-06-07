'use strict';

const csv = require('csv-parser');  
const fs = require('fs');
const geolib = require('geolib');

exports.search_from_json = function(req, res) {
	var searchJson = req.body;
	var responseJson = [];
	var forSearchJson = [];
	for (var i = 0, len = searchJson.length; i < len; i++) {
		responseJson.push(
			{
			  lat: searchJson[i]['lat'],
			  lon: searchJson[i]['lon'],
			  name: searchJson[i]['name'],
			  impressions: 0,
			  clicks: 0
			}
		);

		forSearchJson.push(
			{
			  latitude: searchJson[i]['lat'],
			  longitude: searchJson[i]['lon']
			},
		);
	}

	fs.createReadStream('events.csv')  
	  .pipe(csv())
	  .on('data', function (chunk) {	
	    var response = geolib.findNearest({ latitude: parseFloat(chunk['lat'], 10), longitude: parseFloat(chunk['lon'], 10) }, forSearchJson);
	    for (var i = 0, len = responseJson.length; i < len; i++) {
	    	if (response['latitude'] == responseJson[i]['lat'] && response['longitude'] == responseJson[i]['lon']) {
	    		if ('imp' == chunk['event_type']) {
	    			responseJson[i]['impressions'] = responseJson[i]['impressions'] + 1;
	    		} else {
	    			responseJson[i]['clicks'] = responseJson[i]['clicks'] + 1;
	    		}
	    	}
	    }
	  })
	  .on('end', () => {
	    var goodResponseJson = new Object();
		for (var i = 0, len = responseJson.length; i < len; i++) {
			goodResponseJson[responseJson[i]['name']] = {
			  lat: responseJson[i]['lat'],
			  lon: responseJson[i]['lon'],
			  name: responseJson[i]['name'],
			  impressions: responseJson[i]['impressions'],
			  clicks: responseJson[i]['clicks']
			}
		}

		res.status(200).send(goodResponseJson)
	});
}