
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
