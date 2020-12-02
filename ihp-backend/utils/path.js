/*
 * @Param database  : ODM object 
 * @Param start     : start point of path in geometry coordinates
 * @Param end       : end point of path in geometry coordinates
 * @Param waypoints : all waypoints of path in geometry coordinates
 * @Param itemList  : all items in shopping list by _id in Goods Model
 * @Param readius   : radius searching stores
 * 
 * @Return Form     :   Array of {
 *                          "total_price": total purchasing cost of corresponding path,
 *                          "path": coordinates of path containing start, end, waypoints and stores
 *                      ]
 * } 
 */
exports.selectAllCasesOfBuying = async (database, start, end, waypoints, itemList, radius) => 
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


    const candidates = await drawUpCandidates(database, centerLong, centerLat, radius);
    if (candidates.length == 0) {
        return null;
    }

    const sellingItemIdxForStores = await makeCombinationElements(database, candidates, itemList);
    const buyingCases = makeAllCombinations(sellingItemIdxForStores, candidates, itemNum, start, end, waypoints);
    
    return buyingCases;
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
                                indexPrice['idx'] = Number(goodIdx);
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

function makeAllCombinations(combinationElements, storeInfo, itemNum, start, end, waypoints) {
    var allCombinations = [];
    var combination = [start];
    var wpVisited = Array.from({length: waypoints.length}, () => 0);

    searchBuyingItem(0, 0, 0, allCombinations, combination, combinationElements, 
                        storeInfo, itemNum, end, waypoints, waypoints.length, 0, wpVisited);

    return allCombinations;
}

function searchBuyingItem(totalWaypoint, itemNow, waypointNow, allCombinations, combination, combinationElements,
                             storeInfo, itemNum, end, waypoints, waypointsNum, accumulatedPrice, wpVisited) {
    if (totalWaypoint >= (itemNum + waypointsNum)) {
        let copied = combination.slice();
        copied.push(end);
        let pushed = { 'total_price': accumulatedPrice, 'path': copied };
        allCombinations.push(pushed);
        return ;
    }
    else {
        let storeNum = combinationElements.length;
        if (itemNow < itemNum) {
            for (let storeIdx = 0; storeIdx < storeNum; storeIdx++) {

                let itemIdx = isItemInStore(itemNow, combinationElements[storeIdx]);
                if (itemIdx != 0) {
                    
                    combination.push(storeInfo[storeIdx].geometry.coordinates);
                    let accumulatedThisStep = accumulatedPrice + combinationElements[storeIdx][itemIdx-1].price;
                    searchBuyingItem(totalWaypoint+1, itemNow+1, waypointNow, allCombinations, combination, combinationElements, 
                                        storeInfo, itemNum, end, waypoints, waypointsNum, accumulatedThisStep, wpVisited);
                    combination.pop();
                }
            }
        }

        if (waypointNow < waypointsNum) {
            for (let wpIdx = 0; wpIdx < waypointsNum; wpIdx++) {

                if (wpVisited[wpIdx] == 0) {
                    
                    wpVisited[wpIdx] = 1;
                    combination.push(waypoints[wpIdx]);
                    searchBuyingItem(totalWaypoint+1, itemNow, waypointNow+1, allCombinations, combination, combinationElements, 
                                        storeInfo, itemNum, end, waypoints, waypointsNum, accumulatedPrice, wpVisited);
                    combination.pop();
                    wpVisited[wpIdx] = 0;
                }
            }
        }


    }
}

function isItemInStore(goodIdx, store) {
    for (var i=0; i<store.length; i++) {
        if (store[i]['idx'] == goodIdx) {
            return i+1;
        }
    }
    return 0;
}