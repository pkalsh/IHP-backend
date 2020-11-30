function sortPath(criteria,everyPath){
    everyPath.sort(function(a,b){
        switch(criteria){
            case 'payment':
                return a.payment < b.payment ? -1 : a.payment > b.payment ? 1 : 0;
            case 'totalDistance':
                return a.totalDistance < b.totalDistance ? -1 : a.totalDistance > b.totalDistance ? 1 : 0;
            case 'totalTime':
                return a.totalTime < b.totalTime ? -1 : a.totalTime > b.totalTime ? 1 : 0;
            case 'totalWalk':
                return a.totalWalk < b.totalWalk ? -1 : a.totalWalk > b.totalWalk ? 1 : 0;
            case 'totalWalkTime':
                return a.totalWalkTime < b.totalWalkTime ? -1 : a.totalWalkTime > b.totalWalkTime ? 1 : 0;
        }
        
    });
    return everyPath;
}

module.exports.sortPath = sortPath;