var sortPath = require('../utils/utils.js').sortPublicTransportPath;
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
require('dotenv').config();

// 대중교통 길찾기
function searchPubTransPathAJAX(sx,sy,ex,ey) {
    return new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        var url = `https://api.odsay.com/v1/api/searchPubTransPath?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${process.env.PUBLIC_TRANSPORT_KEY}`;
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onreadystatechange = function() {
    
            if (xhr.readyState == 4 && xhr.status == 200) {
                var section = JSON.parse(xhr.responseText);
                resolve(section);
            }
            else {
                reject(xhr.responseText);
            }
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
            const data = await searchPubTransPathAJAX(sx, sy, ex, ey);

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



module.exports.calcCost = calcCost;