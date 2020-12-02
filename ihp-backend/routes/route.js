const config = require('../config/config');

/*
 * @POST("/route/list")
 * fun requestRouteList(@Body body: Route_Input): Single<Route_Output>
 */ 
module.exports.showLowestCostPath = async (req, res) => {
    var database = req.app.get('database');

    const paramSrc       = req.body.src || req.query.src || req.params.src;
	const paramDst       = req.body.dst || req.query.dst || req.params.dst;
    const paramWaypoints = req.body.mid || req.query.mid || req.params.mid;
    const itemList       = req.body.item || req.query.item || req.params.item;
    console.log("/route/list/" + paramSrc + "/" + paramDst + "/" + paramWaypoints + "/" + itemList + "/ 요청 받음.");

    var jsonResponse = { };
    res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});

    const allCases = await selectAllCasesOfBuying(database, paramSrc, paramDst, paramWaypoints, itemList, config.market_searching_radius);
    if (allCases == null) {
        jsonResponse['resCode'] = 0;
        jsonResponse['error_msg'] = "주위에 검색가능한 매장이 없습니다.";
    }
    else {

        // const transportCase = await transport(allCases);
        // const walkCase = await walk(allCases);
        var resultArr = [];
        var tp = {};
        var walk = {};

        walk['method'] = 1;

        tp['method'] = 2;
        jsonResponse['resCode'] = 1;
        resultArr.push(walk); resultArr.push(tp);
        jsonResponse['result'] = resultArr;
    }

    res.write(JSON.stringify(jsonResponse));
    res.end();
}

