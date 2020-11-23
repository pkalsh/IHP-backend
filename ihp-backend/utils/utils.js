
// 클라이언트에 에러 코드 전송
exports.replyErrorCode = function(res) {
    var jsonResponse = { resCode: 0 }
    res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
    res.write(JSON.stringify(jsonResponse));
    res.end();
}