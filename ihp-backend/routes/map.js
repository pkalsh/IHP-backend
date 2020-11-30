/*
[
    {
        'total_price','path':[a,b,c,d]
    }
    ...
]

=> path는 [x,y], [x,y]... 로 이루어짐.
*/

const API_KEY = 'my api key';

// 대중교통 길찾기
function searchPubTransPathAJAX(sx,sy,ex,ey) {
	var xhr = new XMLHttpRequest();
	var url = `https://api.odsay.com/v1/api/searchPubTransPath?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${API_KEY}`;
	xhr.open("GET", url, true);
	xhr.send();
	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4 && xhr.status == 200) {
            //console.log( xhr.responseText ); // <- xhr.responseText 로 결과를 가져올 수 있음
            var section = JSON.parse(xhr.responseText);
            var ret = [];
            ret.push(section['result']['path']['info']['payment']);
            ret.push(section['result']['path']['info']['totalDistance']);
            ret.push(section['result']['path']['info']['totalTime']);
            ret.push(section['result']['path']['info']['totalWalk']);
            ret.push(section['result']['path']['info']['totalWalkTime']);
            ret.push(sx);
            ret.push(sy);
            ret.push(ex);
            ret.push(ey);

            return ret;
		}
	}
}


function onePath(cost){
    path = {'payment':0, 'totalDistance':0, 'totalTime':0, 'totalWalk':0, 'totalWalkTime':0, 'path':[] };
    var i;
    for(i = 0; i < cost.length; i++){
        path['payment'] += cost[i][0];
        path['totalDistance'] += cost[i][1];
        path['totalTime'] += cost[i][2];
        path['totalWalk'] += cost[i][3];
        path['totalWalkTime'] += cost[i][4];
        path['path'].push(cost[i][5]);
        path['path'].push(cost[i][6]);
    }
    path['path'].push(cost[i-1][7]);
    path['paht'].push(cost[i-1][8]);

    return path;
}

/*
function makeComSet(mapOutput){
    combination_set = [];
    
    for(var a = 0; a < mapOutput.length; a++){
        for(var i = 0; i < mapOutput[a]["path"].length; i++){
            var total_price = mapOutput[a]["total_price"];
            var x = mapOutput[a]['path'][i][0];
            var y = mapOutput[a]['path'][i][1];
            combination_set.push([x,y,total_price]);
        }
    }
    
    return combination_set;
}
*/




module.exports.calcCost(mapOutput){
    //var combination_set = makeComSet(mapOutput);
    var ret = [];
    for(var i = 0; i < combination_set.length; i++){
        var sx = combination_set[i]['path'][0][0];
        var sy = combination_set[i]['path'][0][1];
        var cost = [];
        for(var j = 1; j < combination_set[i].length; j++){
            var ex = combination_set[i]['path'][j][0];
            var ey = combination_set[i]['path'][j][1];
            cost.push(searchPubTransPathAJAX(sx,sy,ex,ey));
            var sx = ex;
            var sy = ey;
        }
        ret.push([onePath(cost),combination_set[i]['total_price']]);
    }
    return ret;
}
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