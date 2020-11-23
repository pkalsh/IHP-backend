var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var apiConfig = require('../config/api-config.json');

var initStoreData = function(database) {
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + apiConfig["price-api"].key;
	queryParams += '&' + encodeURIComponent('goodId') + '=' + encodeURIComponent('5');

	request({
		url: apiConfig["price-api"]["store-url"] + queryParams,
		method: 'GET'
	}, function (error, response, body) {
		var xml = body;
		
		parser.parseString(xml, (err, result) => {
			queryResult = result['response']['result'][0]['iros.openapi.service.vo.entpInfoVO'];
			//console.dir(queryResult);
			 
			for(var i=0; i<queryResult.length; i++) {

                var data = queryResult[i];
                try {
                    var latitude = data['xMapCoord'][0], longitude = data['yMapCoord'][0];
                } catch(exception) {
                    latitude = 0;
                    longitude = 0;
                }
				var name = data['entpName'][0];
				var address = data['plmkAddrBasic'][0];		
				var entp_type = data['entpTypeCode'][0];
				try{
				    var postNo = data['postNo'][0];
				} catch(exception) {
					postNo = '';
				}
                    
                try {
                    var tel = data['entpTelno'][0];
                } catch(exception) {
                    tel = "";
                }
		
				var store = new database["StoreModel"]({
					"name": name,
					"address": address,
					"tel": tel,
					"area": data['entpAreaCode'][0],
					"areaDetail": data['areaDetailCode'][0],
					"entpType": entp_type,
					"postNo": postNo,
					"geometry": {
						type: 'Point',
						coordinates: [longitude, latitude]
					}
				});
		
				store.save((err) => {
					if (err) console.dir(err);
				});			
			}
		});
	
	});	
}

/*
 * @param place: place keyword, place name to search
 * @param query: requested information, array type
 * @return: json object for result
 */
var requestGooglePlace = function(place, query) {
    var queryString = "";
    for(var i=0; i<query.length; i++) {
        queryString += query[i];
        if(i != query.length-1) queryString += ",";
    }

    return new Promise ((resolve, reject) => {
        request({
        url:"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input="+ encodeURIComponent(place) + 
        "&inputtype=textquery&fields="+ queryString + "&key=" + apiConfig["google-api"].key,
    }, function (error, response, body) {
        if(error) reject(error);
        else {
            const parsedResult = JSON.parse(body);
            console.dir(parsedResult);
            resolve(parsedResult);
        }
    });
    });
}

/*
 * @param place: placeId, which is supported by google api
 * @param query: requested information, array type
 * @return: json object for result
 */
var requestGooglePlaceDetails = function(placeId, query) {
    var queryString = "";
    for(var i=0; i<query.length; i++) {
        queryString += query[i];
        if(i != query.length-1) queryString += ",";
    }

    return new Promise((resolve, reject) => {
        request({
        url:"https://maps.googleapis.com/maps/api/place/details/json?place_id="+ encodeURIComponent(placeId) + 
        "&fields="+ queryString + "&key=" + apiConfig["google-api"].key,
    }, function (error, response, body) {
        if(error) reject(error);
        else {
            const parsedResult = JSON.parse(body);
            console.dir(parsedResult);
            resolve(parsedResult);
        }
    })});
}

exports.initStoreData = initStoreData;
exports.requestGooglePlace = requestGooglePlace;
exports.requestGooglePlaceDetails = requestGooglePlaceDetails;
