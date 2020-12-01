
exports.replyErrorCode = function(res) {
    var jsonResponse = { resCode: 0 }
    res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
    res.write(JSON.stringify(jsonResponse));
    res.end();
}

exports.makeQuery = function(baseURI, parameters) {
    var completeQuery = baseURI;
    if (parameters) {
        completeQuery += '?';
        for (let idx=0; idx < parameters.length; idx++) {
            let key = parameters[idx][0], val = parameters[idx][1];
            completeQuery += encodeURIComponent(key);
            completeQuery += '=';
            completeQuery += encodeURIComponent(val);
            if (idx != parameters.length-1) {
                completeQuery += '&';
            }
        }
    }

    return completeQuery;
}

  
exports.sortPath = function(criteria, everyPath) {
    everyPath.sort(function(a,b){
        switch(criteria){
            case 'payment':
                return a[0].payment < b[0].payment ? -1 : a[0].payment > b[0].payment ? 1 : 0;
            case 'totalDistance':
                return a[0].totalDistance < b[0].totalDistance ? -1 : a[0].totalDistance > b[0].totalDistance ? 1 : 0;
            case 'totalTime':
                return a[0].totalTime < b[0].totalTime ? -1 : a[0].totalTime > b[0].totalTime ? 1 : 0;
            case 'totalWalk':
                return a[0].totalWalk < b[0].totalWalk ? -1 : a[0].totalWalk > b[0].totalWalk ? 1 : 0;
            case 'totalWalkTime':
                return a[0].totalWalkTime < b[0].totalWalkTime ? -1 : a[0].totalWalkTime > b[0].totalWalkTime ? 1 : 0;
            case 'price':
                return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
            case 'total_price':
                return a[1]+a[0].payment < b[1]+b[0].payment ? -1 : a[1]+a[0].payment > b[1]+b[0].payment ? 1 : 0;
        }
        
    });
    return everyPath;
}