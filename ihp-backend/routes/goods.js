
/*
 * routing functions for store-related request
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-26
 */

const utils = require('../utils/utils');

/*
 * @POST("/item/list")
 * fun requestItemList(@Body body: Item_Input): Single<ArrayList<Item_Output>>
 */
var listGoods = function(req, res) {
    var paramType = req.body.item_one || req.query.item_one || req.params.item_one;
    var paramSorting = req.body.item_two || req.query.item_two || req.params.item_two;
    var paramWord = req.body.item_word || req.query.item_word || req.params.item_word;
    var database = req.app.get('database');
    console.log("/item/list/" + paramWord + "/" + paramType + "/" + paramSorting + " 요청 받음.");

    console.log(typeof(paramSorting));
    if(paramSorting == "") {
        paramSotring = "1";
    }

    if (database.db) {
        
        database.GoodsModel.findGoodsList(paramType, paramWord, function(err, results) {
            if (err) {
                console.error('전체 조회 중 에러 발생 : ' + err.stack);
                utils.replyErrorCode(res);
                return;
            }

            if (results) {
                var arrResponse = []
                for(let i=0; i < results.length; i++) {
                    var item = {};
                    var selected_doc = results[i]._doc;
                    
                    selected_doc["priceInfo"].sort((left,right) => {
                        return left.price < right.price ? -1 : left.price > right.price ? 1 : 0;
                    });

                    item["id"] = selected_doc._id;
                    item["name"] = selected_doc.name;
                    if (selected_doc.priceInfo.length > 0) {
                        item["priceInfo"] = selected_doc.priceInfo[0].price;
                    }
                    arrResponse.push(item);
                }

                console.log(arrResponse);
                sortGoodsJsonResult(paramSorting, arrResponse);
                console.log(arrResponse);

                var jsonResponse = { resCode: 1, result: arrResponse };
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

/* 
 * @POST("/item/info/{public_id}")
 *    fun requestItemInfo(@Header(@Body body: public_id): Single<Item_Info>
 */
var searchById = function(req, res) {
    var id = req.body.public_id || req.query.public_id || req.params.public_id;
    console.log("/item/info/" + id + ": 요청 받음.");
    var database = req.app.get('database');

    if (database.db) {
        database.GoodsModel.findById(id, function(err, resultInfo) {
            if (err) {
                console.error('전체 조회 중 에러 발생 : ' + err.stack);
                utils.replyErrorCode(res);
                return;
            }

            if (resultInfo) {
                var jsonResponse = { resCode: 1, result: resultInfo };
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

function sortGoodsJsonResult (criterion, response) {
    if (criterion == "1") {
        response.sort((left, right) => {
            return left.priceInfo < right.priceInfo ? 
                    -1 : left.priceInfo > right.priceInfo ? 1 : 0;
        });
    }
    else if (criterion == "2") {
        response.sort((left, right) => {
            return left.priceInfo > right.priceInfo ? 
                    -1 : left.priceInfo < right.priceInfo ? 1 : 0;
        });
    }
    else if (criterion == "3") {
        response.sort((left, right) => {
            return left.name < right.name ? 
                    -1 : left.name > right.name ? 1 : 0;
        });
    }
    else if (criterion == "4") {
        response.sort((left, right) => {
            return left.name > right.name ? 
                    -1 : left.name < right.name ? 1 : 0;
        });
    }
}

module.exports.listGoods = listGoods;
module.exports.searchById = searchById;
