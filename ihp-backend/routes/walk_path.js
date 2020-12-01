var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
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

function searchWalkPath(url) {

	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();

	xhr.onreadystatechange = function() {

		if (xhr.readyState == 4 && xhr.status == 200) {

            var section = JSON.parse(xhr.responseText);

            var resultData = section.features

            //결과 출력
            var tDistance = "총 거리 : "
                    + ((resultData[0].properties.totalDistance/1000))
                            .toFixed(1) + "km,";
            var tTime = " 총 시간 : "
                    + ((resultData[0].properties.totalTime/60))
                            .toFixed(0) + "분";

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

            // console.log(path)

            result = [path,tTime,tDistance]

            console.log(result)

            return result;
		}
	}
}
// searchWalkPath(url);

function GiveAllWalkPath(startX,startY,endX,endY,startName,endName){
    
    var basic_param = url
    + "&appKey=" + apiKey
    + "&startX=" + startX
    + "&startY=" + startY
    + "&endX=" + endX
    + "&endY=" + endY
    + "&startName=" + encodeURIComponent("startName")
    + "&endName=" + encodeURIComponent("endName");

    var recommen_parm = basic_param
    + "&searchOption=" + 0;

    var shortest_param = basic_param
    + "&searchOption=" + 10;

    var recommen_path = searchWalkPath(recommen_parm)
    var shortest_path = searchWalkPath(shortest_param)

    var all_walk_path = [recommen_path,shortest_path]

    console.log(all_walk_path)

    return all_walk_path
    
}

// GiveAllWalkPath(startX,startY,endX,endY,startName,endName)