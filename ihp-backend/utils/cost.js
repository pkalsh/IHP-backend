var sortPath = require('../utils/utils.js').sortPublicTransportPath;
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
require('dotenv').config();

// 대중교통 길찾기
function searchPubTransPathAJAX(sx,sy,ex,ey) {
    return new Promise(async function(resolve,reject){
        var xhr = new XMLHttpRequest();
        var url = `https://api.odsay.com/v1/api/searchPubTransPath?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${process.env.PUBLIC_TRANSPORT_KEY}`;
        
        xhr.open("GET", url, false);
        xhr.send();
        
        if (xhr.status === 200) {
            var jsonResponse = JSON.parse(xhr.responseText);
            console.log (jsonResponse.hasOwnProperty('error'));
            if (!jsonResponse.hasOwnProperty('error')) {
                resolve(JSON.parse(xhr.responseText));
            }
            else {
                if (jsonResponse.error.code != -9 || jsonResponse.error.code != -8 
                        || jsonResponse.error.code != 500) {
                        reject(jsonResponse.error.code);
                    }
            }
            
        } else {
            reject(null);
        }
    });
}


async function calcCost(combination_set, criteria) {
    
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
            
            if (!(sx == ex && sy == ey)) {
                var data;
                try {
                    data = await searchPubTransPathAJAX(sx, sy, ex, ey);
                } catch(err) { 
                    if (err == null) {
                        data = null;
                    }
                    else {
                        try {
                            const walkCost = await calcWalkCase([[sx,sy], [ex,ey]]);
                            cost.time += walkCost.time;
                            cost.distance += walkCost.distance;
                            let pushedPath = {'trafficType': 3,
                                              'distance'   : walkCost.distance,
                                              'sectionTime': walkCost.time};

                            cost.path.push(pushedPath);
                            sx=ex; sy=ey;
                            continue;
                        } catch(walkError) {
                            console.error(walkError);
                            data = null;
                        }
                    }
                }

                if (data == null) break;

                sortPath(criteria,data);
                cost.time += data['result']['path'][0]['info']['totalTime'];
                cost.distance += data['result']['path'][0]['info']['totalDistance'];
                cost.price += data['result']['path'][0]['info']['payment'];
                for (const subPath of data['result']['path'][0]['subPath']) {
                    let pushed = { 'trafficType' : subPath.trafficType,
                                    'distance'   : subPath.distance, 
                                    'sectionTime': subPath.sectionTime };
                    cost.path.push(pushed);
                }
                sx = ex;
                sy = ey;
            }
        }
        cost.price +=  + combination_set[i]['total_price'];
        ret.push(cost);
    }
    console.log(ret);
    return ret;
}

async function sendingFormat(mapOutput){
    var price = calcCost(mapOutput,'payment').then(function(value){
        return value;
    });
    var time = calcCost(mapOutput,'totalTime').then(function(value){
        return value;
    });
    return ({'price':await price, 'time':await time});
}

function searchWalkPath(url) {
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();

        var result={}

        if (xhr.status == 200) {

            var section = JSON.parse(xhr.responseText);
            //console.log(section)

            var resultData = section.features

            //결과 출력
            var tDistance = resultData[0].properties.totalDistance;
            var tTime =  (parseInt(resultData[0].properties.totalTime/60));

            result={'time':tTime, 'distance': tDistance};
            console.dir(result);
            resolve(result);
        }
        else {
            // var section = JSON.parse(xhr.responseText);
            var message = "요청 데이터 오류입니다. 파라미터를 확인해주세요.([022012]목적지 인근 길안내 도로가 없습니다. 목적지를 변경해주세요.";
            
            reject(message);
        }
    });
}

async function calcWalkCase(input){
    console.log(input);
    var url ='https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1';

    const [start, end] = input;
    const [sx,sy] = start;
    const [ex,ey] = end;

    console.log(sx + ", " + sy);
    console.log(ex + ", " + ey);
        

    //${sx}
    var basic_param = url
     + "&appKey=" + process.env.TMAP_API_KEY
     + "&startX=" + sx
     + "&startY=" + sy
     + "&endX=" + ex
     + "&endY=" + ey
     + "&startName=" + encodeURIComponent("출발지")
     + "&endName=" + encodeURIComponent("도착지");

    var shortest_param = basic_param + "&searchOption=" + 10;

    return await searchWalkPath(shortest_param);
}


module.exports.getLowestCostPath = sendingFormat;