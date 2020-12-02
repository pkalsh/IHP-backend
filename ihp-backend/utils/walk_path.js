var xml2js = require('xml2js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var config=require('../config/config.js')

var url ='https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1';
var apiKey = config.API_KEY // api key
var startX =  "126.97871544"
var startY = "37.56689860"
var endX =  "127.00160213"
var endY ="37.57081522"
var reqCoordType =  "WGS84GEO"
var resCoordType = "EPSG3857"
var startName = "출발지"
var endName = "도착지"

// 경로 탐색 옵션입니다.
// - 0: 추천 (기본값)
// - 4: 추천+대로우선
// - 10: 최단
// - 30: 최단거리+계단제외

function searchWalkPath(url,total_price) {
    return new Promise(function(resolve, reject) {

	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();

    var result={}

	xhr.onreadystatechange = function() {

        // console.log( xhr.status)

		if (xhr.readyState == 4 && xhr.status == 200) {

            var section = JSON.parse(xhr.responseText);

            // console.log(section)

            var resultData = section.features

            //결과 출력
            var tDistance = ((resultData[0].properties.totalDistance/1000));
            var tTime =  ((resultData[0].properties.totalTime/60));

            var path=[]
            var lat_arr = []
            var lng_arr = []
            
            for ( var i in resultData) { //for문 [S]
                var geometry = resultData[i].geometry;
            
                if (geometry.type == "LineString") {

                    for ( var j in geometry.coordinates) {

                        // 경로들의 결과값(구간)들을 포인트 객체로 변환 

                        var lat=geometry.coordinates[j][0]
                        var lng = geometry.coordinates[j][1]

                        lat_arr.push(lat)
                        lng_arr.push(lng)
                    }
                } 
            }

            var unique_lat = new Set(lat_arr)
            var unique_lng = new Set(lng_arr)

            lat_arr=Array.from(unique_lat);
            lng_arr=Array.from(unique_lng);

            for (var a=0;a<lat_arr.length;a++){
                var point = {lat : lat_arr[a], lng:lng_arr[a]}
                path.push(point)
            }

            result={total_price,path,tTime,tDistance}

            resolve(result);
        }
        else if (xhr.readyState == 4 && xhr.status != 200){
            // var section = JSON.parse(xhr.responseText);
            var message = "요청 데이터 오류입니다. 파라미터를 확인해주세요.([022012]목적지 인근 길안내 도로가 없습니다. 목적지를 변경해주세요.";
            
            reject(message)
        }

        }
    })
}

function GiveOutput(input){
    var dataset = Array.from(new Set(input))

    var test_result=[]
    var final_result=[]
    var shortest_results=[]

    var output=[]

    for (var n=0; n<dataset.length; n++){
        
        this_path = dataset[n]['path']

        start = this_path[0]
        end = this_path[this_path.length-1]
        var pass=[]

        for (var j=1; j<this_path.length-2;j++){
            pass.push(this_path[j])
        }
        const [sx,sy] = start
        // sx = start[0]
        // sy = start[1]
        const [ex,ey] = end
        // ex = end[0]
        // ey = end[1]

        var pass_list = ""

        for (var k=0;k<pass.length;k++){
            if(k!=pass.length-1)
            {
            pass_list += pass[k][0] +","+pass[k][1]+"_"}
            else{
                pass_list += pass[k][0]+","+pass[k][1]
            }
        }

        //${sx}
        var basic_param = url
        + "&appKey=" + apiKey
        + "&startX=" + sx
        + "&startY=" + sy
        + "&endX=" + ex
        + "&endY=" + ey
        + "&startName=" + encodeURIComponent("출발지")
        + "&endName=" + encodeURIComponent("도착지");

        var shortest_param = basic_param
        + "&searchOption=" + 10
        + "&passList=" +pass_list;

        //
        // var basic_param = url
        // + "&appKey=" + apiKey
        // + "&startX=" + "126.528309805811"
        // + "&startY=" + "33.512791202097"
        // + "&endX=" + "126.680727117911"
        // + "&endY=" + "37.4039703012009"
        // + "&startName=" + encodeURIComponent("출발지")
        // + "&endName=" + encodeURIComponent("도착지");

        
        // var shortest_param = basic_param
        // + "&searchOption=" + 10
        // + "&passList=" +"128.6912999464825,34.88799258881239_128.6912999464825,34.88799258881239_127.71701601078725,34.93423462196381";

        var promise_tmp = searchWalkPath(shortest_param,dataset[n].total_price)

        output.push(promise_tmp)

    }

    return Promise.all(output).then(final_result=>{
        final_result.sort((a,b)=>{
            return a.tDistance-b.tDistance
        })
        return final_result
    })
}

testset =     [
    {
        total_price: 12700,
        path: [
        [126.97871544,37.56689860],
        [126.92577620,37.55337145],
        [126.92774822,37.55395475],
        [127.00160213,37.57081522]
        ]
    },
    {
        total_price: 12700,
        path: [
        [126.97871544,37.56689860],
        [126.92774822,37.55395475],
        [126.92577620,37.55337145],
        [127.00160213,37.57081522]
        ]
    }
]

final_output = GiveOutput(testset)

final_output.then(result=>{
    console.log(result)
}).catch(message=>{
    console.log(message)
})

// console.log(final_output)