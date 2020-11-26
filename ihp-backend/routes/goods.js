/*
 * routing functions for store-related request
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-26
 */

const utils = require('../utils/utils');

/*
 *Item_Input:
 *   @SerializedName("item_word")
 *   var item_word: String,
 *
 *   @SerializedName("item_one")
 *   var item_one: String,
 *
 *   @SerializedName("item_two")
 *   var item_two: String,
 *
 *   @SerializedName("item_three")
 *   var item_three: String,
 *
 */

/*
 * @POST("/item/list")
 * fun requestItemList(@Body body: Item_Input): Single<ArrayList<Item_Output>>
 */
var listGoods = function(req, res) {
    var paramType = req.body.item_one || req.query.item_one || req.params.item_one;
    var paramSorting = req.body.item_two || req.query.item_two || req.params.item_two;
    var paramWord = req.body.item_word || req.query.item_word || req.params.item_word;
    var database = req.app.get('database');

    // TODO 입력하지 않았을 땐 뭐로 오나요?
    if(paramSorting == "") {
        paramSotring = 'name';
    }

    if (database.db) {
        database.GoodsModel.findAllGoods(paramType, paramSorting, paramWord, function(err, results) {
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
                    database.GoodsModel.sortPriceAsc(selected_doc._id, 
                                                     (err, sortResult) => {
                                                         if (err) console.dir(err);
                                                         else {
                                                             console.log('정렬 성공');
                                                         }
                                                     });
                                                     

                    item["id"] = selected_doc._id;
                    item["name"] = selected_doc.name;
                    if (selected_doc.priceInfo.length > 0) {
                        item["priceInfo"] = selected_doc.priceInfo[0].price 
                    }
                    arrResponse.push(item);
                }

                var jsonResponse = { resCode: 1, result: arrResponse }
                //console.dir(jsonResponse);
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
 *    fun requestItemInfo(@Header(@Path("public_id") public_id:String): Single<Item_Info>
 */
var searchById = function(req, res) {
    var id = req.body.public_id || req.query.public_id || req.params.public_id;
    console.log(id);
    var database = req.app.get('database');

    if (database.db) {
        database.GoodsModel.findById(id, function(err, resultInfo) {
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

module.exports.listGoods = listGoods;
module.exports.searchById = searchById;