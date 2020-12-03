const { getLowestCostPath } = require('../utils/cost');
const { selectAllCasesOfBuying } = require('../utils/path');
const { getPublicTransportLowestCost } = require('../utils/public_transport');

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

    const allCases = await selectAllCasesOfBuying(database, paramSrc, paramDst, paramWaypoints, itemList, 2000);
    if (allCases == null) {
        jsonResponse['resCode'] = 0;
        jsonResponse['error_msg'] = "주위에 검색가능한 매장이 없습니다.";
    }
    else {
        const lp = await getLowestCostPath(allCases.slice(0,1));
    
        jsonResponse['resCode'] = 1;
        jsonResponse['result'] = lp.time;
    }

    res.write(JSON.stringify(jsonResponse));
    res.end();
}

