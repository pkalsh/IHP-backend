
/*
    받아오는 매개변수가 [ [[],[],[]], ... ,[[],[],[]] ...] 형태의  삼중리스트라고 가정.. 또는 4중
    combination_set = [
        [
            [x,y,info], [x,y,info], [x,y,info], [x,y,info],...
        ]
        ,[ ... ]
        ,[ ... ]
        ...
    ]
    info는 상품에 대한 정보를 담은 변수 또는 리스트
    [x,y,info]에서 x,y는 해당 위치의 좌표 vlaue

    아래 코드에서는 [x,y,info],[x,y,info]... 가 순서대로 나열되어있다고 가정.
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
            ret.push(sx).push(sy).push(ex).push(ey);

            return ret;
		}
	}
}

function calcCost(mapOutput){
    var combination_set = makeComSet(mapOutput);
    var ret = [];
    for(var i = 0; i < combination_set.length; i++){
        var sx = combination_set[i][0][0];
        var sy = combination_set[i][0][1];
        //var info = combination_set[i][0][2];
        var cost = [];
        for(var j = 1; j < combination_set[i].length; j++){
            var ex = combination_set[i][j][0];
            var ey = combination_set[i][j][1];
            cost.push(searchPubTransPathAJAX(sx,sy,ex,ey));
            var sx = ex;
            var sy = ey;
        }
        ret.push(everyPath(cost));
    }
    return ret;
}

function everyPath(cost){
    path = {'payment':0, 'totalDistance':0, 'totalTime':0, 'totalWalk':0, 'totalWalkTime':0, 'path':[] };
    var i;
    for(i = 0; i < cost.length; i++){
        path['payment'] += cost[0];
        path['totalDistance'] += cost[1];
        path['totalTime'] += cost[2];
        path['totalWalk'] += cost[3];
        path['totalWalkTime'] += cost[4];
        path['path'].push(cost[5]).push(cost[6]);
    }
    path['path'].push(cost[7]).push(cost[8]);

    return path;
}

function makeComSet(mapOutput){
    combination_set = [];
    for(var i = 0; i < mapOutput["result"].length; i++){
        var info = {};
        info.id = mapOutput["result"][i]["id"];
        info.name = mapOutput["result"][i]["name"];
        info.address = mapOutput["result"][i]["address"];
        var x = mapOutput["result"][i]["geometry"]["coordinates"][0];
        var y = mapOutput["result"][i]["geometry"]["coordinates"][1];
        combination_set.push([x,y,info]);
    }
    return combination_set;
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