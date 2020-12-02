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
            resolve(JSON.parse(xhr.responseText));
        }
        else {
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
            
            var data;
            try {
                data = await searchPubTransPathAJAX(sx, sy, ex, ey);
            } catch(err) { data = null; }

            if (data == null) continue;

            sortPath(criteria,data);
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

async function sendingFormat(mapOutput){
    var price = calcCost(mapOutput,'payment').then(function(value){
        return value;
    });
    var time = calcCost(mapOutput,'totalTime').then(function(value){
        return value;
    });
    return ({'price':await price, 'time':await time});
}

module.exports.getPublicTransportLowestCost = sendingFormat;