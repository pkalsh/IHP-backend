/*
[
    {
        'total_price','path':[a,b,c,d]
    }
    ...
]

=> path는 [x,y], [x,y]... 로 이루어짐.
*/

var sort = require('../utils/sort.js');

const API_KEY = 'my api key';

// 대중교통 길찾기
function searchPubTransPathAJAX(sx,sy,ex,ey) {
    return new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        var url = `https://api.odsay.com/v1/api/searchPubTransPath?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${API_KEY}`;
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onreadystatechange = function() {
    
            if (xhr.readyState == 4 && xhr.status == 200) {
                //console.log( xhr.responseText ); // <- xhr.responseText 로 결과를 가져올 수 있음
                var section = JSON.parse(xhr.responseText);
                return section;
            }
        }
    });
}


async function calcCost(combination_set, criteria) {
    //var combination_set = makeComSet(mapOutput);
    var ret = [];
    for (var i = 0; i < combination_set.length; i++) {
        var sx = combination_set[i]['path'][0][0];
        var sy = combination_set[i]['path'][0][1];
        var cost = {};
        cost.path = [];
        cost.time = 0;
        cost.distance = 0;
        cost.price = 0;
        for (var j = 1; j < combination_set[i]['path'].length; j++) {
            var ex = combination_set[i]['path'][j][0];
            var ey = combination_set[i]['path'][j][1];
            var data = await searchPubTransPathAJAX(sx, sy, ex, ey);
            mysort.sortPath(criteria,data);
            cost.time += data['result']['path'][0]['info']['totalTime'];
            cost.distance += data['result']['path'][0]['info']['totalDistance'];
            cost.price += data['result']['path'][0]['info']['payment'];
            cost.path.push(data['result']['path'][0]['subPath']);
            var sx = ex;
            var sy = ey;
        }
        cost.price +=  + combination_set[i]['total_price'];
        ret.push(cost);
    }
    console.log(ret);
    return ret;
}

module.exports.calcCost = calcCost;
/*
 * @POST("/map/location")
 * fun requestMapLocation (@Body body: Map_Input : Single<ArrayList<Map_Output>>
 */ 
module.exports.showAllStores = (req, res) => {
    var database = req.app.get('database');

    if (database.db) {
		database.StoreModel.getAllStores((err, results) => {
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
                    item["geometry"] = results[i]._doc.geometry;
                    item["entpType"] = results[i]._doc.entpType;
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
}