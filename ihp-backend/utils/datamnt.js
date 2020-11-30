/*
 * utils related with API
 * mainly build a local database 
 *
 * @date 2020-11-24
 * @author pkalsh
 * @updated 2020-11-26
 */

var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const { makeQuery } = require('./utils');
require('dotenv').config();

var fillGeolocation = async function(database) {
    var base_uri = "https://dapi.kakao.com/v2/local/search/keyword.json";
    var header = {
        'Authorization': 'KakaoAK ' + process.env.KAKAO_API_KEY,
    };

    database.StoreModel.find({}, async (err, stores) => {
        if (err) console.error(err);
        else {
            for (var i=300; i<stores.length; i++) {
                var id = stores[i]._doc._id;
                console.log(i + " " + id);
                var parameters = [['sort', 'accuracy'], ['query', stores[i]._doc.address]];
                var query = makeQuery(base_uri, parameters);
                var options = {
                    url: query,
                    method: 'GET',
                    headers: header
                };

                
                request(options, async (error, response, body) => {

                    if (error) console.error(error);
                    else if (response.statusCode == 200) {
                        var jsonResult = JSON.parse(body);
                        if (jsonResult['documents'].length) {
                            let long = Number(jsonResult['documents'][0]['x']);
                            let lat = Number(jsonResult['documents'][0]['y']);
                            database.StoreModel.setGeometry(id, long, lat)
                                .then((err, result) => {
                                    if (err) console.error(err);
                                    else console.log(result);
                                });
                        }
                    }
                });

                await sleep(2000);
                
            }
        }
    });

}

const sleep = (ms) => {
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}


var initStoreData = function(database) {
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.PRICE_API_KEY;
	queryParams += '&' + encodeURIComponent('goodId') + '=' + encodeURIComponent('5');

	return new Promise((resolve, reject) => {request({
		url: process.env.STORE_URL + queryParams,
		method: 'GET'
	}, function (error, response, body) {
		if (error) reject(error);
		
		parser.parseString(body, (err, result) => {
			queryResult = result['response']['result'][0]['iros.openapi.service.vo.entpInfoVO'];
			 
			for(var i=0; i<queryResult.length; i++) {
                var data = queryResult[i];
                var id = data['entpId'][0];
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
                    "entpId": id,
					"name": name,
					"address": address,
					"tel": tel,
					"area": data['entpAreaCode'][0],
					"areaDetail": data['areaDetailCode'][0],
					"entpType": entp_type,
					"postNo": postNo,
					"geometry": {
						type: 'Point',
						coordinates: [0, 0]
					}
				});
		
				store.save((err) => {
					if (err) console.dir(err);
				});
            }
            
            resolve(response);
		});
	
	});	
});
}

var initGoodsData = function(database) {
    let queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.PRICE_API_KEY;
		
	return new Promise((resolve, reject) => {
        request({
            url: process.env.PRODUCT_API + queryParams,
            method: 'GET'
        }, function (error, response, body) {
            if (error) reject(error);

            parser.parseString(body, (err, result) => {
                var resultArr = result['response']['result'][0]['item'];
                for(let i = 0; i<resultArr.length; i++) {
                    var queryResult = resultArr[i];
                    
                    var id = queryResult['goodId'][0];
                    var name = queryResult['goodName'][0];
                    var total = queryResult['goodTotalCnt'][0];
                    var totalDiv = queryResult['goodTotalDivCode'][0];
                    var productEntp = queryResult['productEntp'];
                    var type = queryResult['goodSmlclsCode'][0];
                            
                    if(productEntp == undefined) {
                        productEntp = '';
                    }

                    var product = new database["GoodsModel"]({
                        "goodId": id,
                        "name": name,
                        "totalDiv": totalDiv,
                        "price": [],
                        "total": total,
                        "productEntp": productEntp,
                        "goodSmlType": type
                    });

                    product.save((err) => {
                        if (err) console.dir(err);
                    });
                }
            });

            resolve(response);
    }); });
}


var fillPriceData = function(database, inspectDate) {
    console.log('fillPriceData 호출됨.');
    for (var goodIdStr = 1000; goodIdStr<1100; goodIdStr++) {
        goodIdStr = goodIdStr.toString();
    database.GoodsModel.find({goodId: goodIdStr}, (err, goods) => {
        if (err) {
            console.error(err);
            return;
        }
        
        if (goods != undefined && goods.length != 0) {
        //for (var gidx = 420; gidx < goods.length; gidx++) {
            var goodId = goods[0]._doc.goodId;
            var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + process.env.PRICE_API_KEY;
            queryParams += '&' + encodeURIComponent('goodInspectDay') + '=' + encodeURIComponent(inspectDate);
            queryParams += '&' + encodeURIComponent('goodId') + '=' + encodeURIComponent(goodId.toString());

            if (goods[0]._doc.priceInfo.length == 0) {
                request({
                    url: process.env.PRICE_URL + queryParams,
                    method: 'GET'
                }, function (error, response, body) {
                    if (body != undefined) {
                        parser.parseString(body, (err, result) => {
                            database.StoreModel.find({}, (err, stores) => {
                                    queryResult = result['response']['result'][0]['iros.openapi.service.vo.goodPriceVO'];
                                    for (var qidx = 0; qidx < queryResult.length; qidx++) {
                                        var resultEntpId = queryResult[qidx]['entpId'][0];
                                        var resultPrice = parseInt(queryResult[qidx]['goodPrice'][0]);
                                        if (qidx==0) console.log(resultPrice);
                                        for (var sidx = 0; sidx < stores.length; sidx++) {
                                            var databaseEntpId = stores[sidx]._doc.entpId;
                                            if (databaseEntpId == resultEntpId) {
                                                var storeObjectId = stores[sidx]._doc._id;
                                                database.GoodsModel.findByIdAndUpdate(goods[0]._doc._id,
                                                    {'$push': {'priceInfo': {'price': resultPrice, 'entp': storeObjectId}}},
                                                    {'new':true, 'upsert':true},
                                                    function(err, results) {
                                                        if (err) {
                                                            console.error('가격 데이터 추가 중 에러 발생');
                                                            return ;
                                                        } 
                                                    });                             
                                            }
                                        }
                                    }
                                });
                        });
                    }
                });
            }}
        //}
    });
    }
}



exports.initStoreData = initStoreData;
exports.initGoodsData = initGoodsData;
exports.fillPriceData = fillPriceData;
exports.fillGeolocation = fillGeolocation;
