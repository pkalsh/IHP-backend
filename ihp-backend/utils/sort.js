function sortPath(criteria,everyPath){
    everyPath['result']['path'].sort(function(a,b){
        switch(criteria){
            case 'payment':
                return a['info'].payment < b['info'].payment ? -1 : a['info'].payment > b['info'].payment ? 1 : 0;
            case 'totalDistance':
                return a['info'].totalDistance < b['info'].totalDistance ? -1 : a['info'].totalDistance > b['info'].totalDistance ? 1 : 0;
            case 'totalTime':
                return a['info'].totalTime < b['info'].totalTime ? -1 : a['info'].totalTime > b['info'].totalTime ? 1 : 0;
            case 'totalWalk':
                return a['info'].totalWalk < b['info'].totalWalk ? -1 : a['info'].totalWalk > b['info'].totalWalk ? 1 : 0;
            case 'totalWalkTime':
                return a['info'].totalWalkTime < b['info'].totalWalkTime ? -1 : a['info'].totalWalkTime > b['info'].totalWalkTime ? 1 : 0;
        }
        
    });
    return everyPath;
}

module.exports.sortPath = sortPath;