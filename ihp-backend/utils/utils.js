
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

  
exports.sortPublicTransportPath = function(criteria, everyPath) {
    everyPath.sort(function(a,b){
        everyPath['result']['path'].sort(function(a,b){
            switch(criteria){
                case 'payment':
                    return a['info'].payment < b['info'].payment ? -1 : a['info'].payment > b['info'].payment ? 1 : 0;
                case 'totalDistance':
                    return a['info'].totalDistance < b['info'].totalDistance ? -1 : a['info'].totalDistance > b['info'].totalDistance ? 1 : 0;
                case 'totalTime':
                    return a['info'].totalTime < b['info'].totalTime ? -1 : a['info'].totalTime > b['info'].totalTime ? 1 : 0;
                case 'totalWalk':
                    return a['info'].totalWalk < b['info'].totalWalk ? -1 : a['info'].totalWalk > b['info'].totalWalk ? 1 : 0;
                case 'totalWalkTime':
                    return a['info'].totalWalkTime < b['info'].totalWalkTime ? -1 : a['info'].totalWalkTime > b['info'].totalWalkTime ? 1 : 0;
            }
            
        });
        return everyPath;
});}