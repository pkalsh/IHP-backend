/*
 * routing functions for store-related request
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-22
 */


 /*
  * json-form
  * {
  *     "resCode"": 응답코드 (성공: 1, 에러: 0),
  *      "result": 조회 결과
  * }
  */
var showAllGoods = function(req, res) {
    
    var database = req.app.get('database');

    if (database.db) {
        database.GoodsModel.findAllGoods(function(err, results) {
            if (err) {
                console.error('전체 조회 중 에러 발생 : ' + err.stack);
                
                var jsonResponse = { resCode: 0 }
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(jsonResponse));
                res.end();

                return;
            }

            if (results) {
                var arrResponse = []
                for(let i=0; i < results.length; i++) {
                    arrResponse.push(results[i]._doc);
                }

                var jsonResponse = { resCode: 1, result: arrResponse }
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write(JSON.stringify(jsonResponse));
                res.end();
            }
        });
    } else {
        var jsonResponse = { resCode: 0 }
        res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
        res.write(JSON.stringify(jsonResponse));
        res.end();
    }
}


module.exports.showAllGoods = showAllGoods;