/*
 * routing functions for store-related request
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-23
 */

/*
 * Market_Input:
 *   @SerializedName("market_word")
 *   var market_word: String,

 *   @SerializedName("market_one")
 *   var market_one: String,

 *   @SerializedName("market_two")
 *   var market_two: String,

 *   @SerializedName("market_three")
 *   var market_three: String,
 */

const utils = require('../utils/utils');

 /*
  * @POST("/market/list")
  * 	fun requestMarketList(@Body body: Market_Input): Single<ArrayList<Market_Output>>
  */ 
var listStores = function(req, res) {
 
    var paramName = req.body.market_word || req.query.market_word || req.params.market_word;
	var paramType = req.body.market_one || req.query.market_one || req.params.market_one;
	var paramSC = req.body.market_two || req.query.market_two || req.params.market_two;
	
	var database = req.app.get('database');
	
	if (database.db) {
		database.StoreModel.searchStore(paramName,
										 paramType,
										 paramSC,
										 function(err, results) {
            if (err) {
                console.error('전체 조회 중 에러 발생 : ' + err.stack);
                utils.replyErrorCode(res);
                return;
            }

            if (results) {
                var arrResponse = []
                for(let i=0; i < results.length; i++) {
                    var item = {};
                    item["id"] = results[i]._doc._id;
                    item["name"] = results[i]._doc.name;
                    item["address"] = results[i]._doc.address;
                    arrResponse.push(item);
                }

                var jsonResponse = { resCode: 1, result: arrResponse }
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(jsonResponse));
                res.end();
            } else {
                utils.replyErrorCode(res);
            }
        });
    } else {
        utils.replyErrorCode(res);
    }
	
};

 /*
  * @POST("/market/info/{public_id}")
  * 	fun requestMarketInfo(@Header(@Path("public_id") public_id:String): Single<Market_Info>
  */
 var searchById = function(req, res) {
    var id = req.body.public_id || req.query.public_id || req.params.public_id;
    var database = req.app.get('database');

    if (database.db) {
        database.StoreModel.findById(id, function(err, resultInfo) {
            if (err) {
                console.error('전체 조회 중 에러 발생 : ' + err.stack);
                utils.replyErrorCode(res);
                return;
            }

            if (resultInfo) {
                var jsonResponse = { resCode: 1, result: resultInfo }
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(jsonResponse));
                res.end();
            } else {
                utils.replyErrorCode(res);
            }
        });
    } else {
        utils.replyErrorCode(res);
    }
}

module.exports.listStores = listStores;
module.exports.searchById = searchById;