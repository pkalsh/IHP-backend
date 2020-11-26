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