const async = require('async');

/*
 * @Param database  : ODM object 
 * @Param start     : start point of path in geometry coordinates
 * @Param end       : end point of path in geometry coordinates
 * @Param waypoints : all waypoints of path in geometry coordinates
 * @Param itemList  : all items in shopping list by _id in Goods Model
 * 
 * @Return Form     :   "stores" : store mongoose id, store name, geomtry coordinates with index referenced by "buying_cases"
 *                      "buying_cases" : store_id (store mongoose id), price (price of the item in chosen store),
 *                                       idx (referencing index of "stores") 
 * 
 *                      [{
 *                          "stores': array of {_id, name, geometry} object,
 *                          "buying_cases" : array of { store_id, price, idx } object => one case
 *                                           Actual saved cases is array of case (upper representation)
 *                      }]
 * } 
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

    var storesAndBuyingCases = {};
    const candidates = await drawUpCandidates(database, centerLong, centerLat, 20000);
    const sellingItemIdxForStores = await makeCombinationElements(database, candidates, itemList);
    const buyingCases = makeAllCombinations(sellingItemIdxForStores, candidates, itemNum);

    storesAndBuyingCases['stores'] = candidates;
    storesAndBuyingCases['buying_cases'] = buyingCases;
    return storesAndBuyingCases;
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

function makeAllCombinations(combinationElements, storeInfo, itemNum) {
    var allCombinations = [];
    var combination = [];

    searchBuyingItem(0, allCombinations, combination, combinationElements, storeInfo, itemNum);

    return allCombinations;
}

function searchBuyingItem(item, allCombinations, combination, combinationElements, storeInfo, itemNum) {
    if (item == itemNum) {
        let copied = combination.slice();
        allCombinations.push(copied);
        return ;
    }
    else {
        let storeNum = combinationElements.length;
        for (let storeIdx = 0; storeIdx < storeNum; storeIdx++) {

            let itemIdx = isItemInStore(item, combinationElements[storeIdx]);
            if (itemIdx != 0) {
                
                combination.push({'store_id': storeInfo[storeIdx]._id, 
                                  'price': combinationElements[storeIdx][itemIdx-1]['price'],
                                  'idx': combinationElements[storeIdx][itemIdx-1]['idx'],
                                }); 
                searchBuyingItem(item+1, allCombinations, combination, combinationElements, storeInfo, itemNum);
                combination.pop();
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