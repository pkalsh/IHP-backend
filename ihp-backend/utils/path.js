const async = require('async');

/*
 * @param database  : ODM object 
 * @param start     : start point of path in geometry coordinates
 * @param end       : end point of path in geometry coordinates
 * @param waypoints : all waypoints of path in geometry coordinates
 * @param itemList  : all items in shopping list by _id in Goods Model
 * 
 */
exports.selectAllCasesOfBuying = async (database, start, end, waypoints, itemList) => 
{
    const itemNum = itemList.length;
    const waypointsNum = waypoints.length;
    var centerLong = start[0] + end[0];
    var centerLat = start[1] + end[1];

    for (waypoint of waypoints) {
        centerLong += waypoint[0];
        centerLat += waypoint[1];
    }

    centerLong /= (2 + waypointsNum);
    centerLat /= (2 + waypointsNum);

    var marketAndBuyingCases = {};
    const candidates = await drawUpCandidates(database, centerLong, centerLat, 20000);
    const sellingItemIdxForStores = await makeCombinationElements(database, candidates, itemList);
    const buyingCases = await makeAllCombinations(sellingItemIdxForStores, itemNum);

    marketAndBuyingCases['markets'] = candidates;
    marketAndBuyingCases['buying_cases'] = buyingCases;
}

async function drawUpCandidates(database, centerLong, centerLat, radius) {
    var candidateStores = [];
    await database.StoreModel.findCircle(centerLong, centerLat, radius)
        .then((results) => {

            for (result of results) {
                let pushed = {};
                pushed['_id'] = result._doc._id;
                pushed['name'] = result._doc.name;
                pushed['geometry'] = result._doc.geometry;
                candidateStores.push(pushed);
            }

            return candidateStores;
        })
        .catch(err => {
            console.error(err);
        });

    return candidateStores;
}

async function makeCombinationElements(database, candidates, itemList) {
    var sellingItemIdxForStores = [];

    for (const sidx in candidates) {
        sellingItemIdxForStores.push([]);
        for (const gidx in itemList) {
            
            const pushed = await (async (database, storeIdx, goodIdx) => {
                
                let itemId = itemList[goodIdx];
                const indexPrice = await database.GoodsModel.findByIdOrg(itemId)
                    .then((results) => {
                        let priceArr = results[0]._doc.priceInfo;
                        
                        for (priceEntp of priceArr) {
                            if (priceEntp._doc.entp.toString() == candidates[storeIdx]['_id'].toString()) {
                                let indexPrice = {};
                                indexPrice['idx'] = goodIdx;
                                indexPrice['price'] = priceEntp['price'];
                                return indexPrice;
                            }
                        }
                            
                        return null;
                    })
                    .catch((err) => {
                        console.error(err);
                    });
                    
                return indexPrice;
            })(database, sidx, gidx);

            if (pushed) {
                sellingItemIdxForStores[sidx].push(pushed);
            }
                
        }
    }

    return sellingItemIdxForStores;
}

async function makeAllCombinations(sellingItems, itemNum) {
    
}