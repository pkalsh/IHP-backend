function sortPath(criteria,everyPath){
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

module.exports.sortPath = sortPath;