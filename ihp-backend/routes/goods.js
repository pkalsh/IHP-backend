var request = require('request');
var convert = require('xml-js');
var SERVICE_KEY = '=95yvl4Q2Y6DIGgpJ8C%2FdqYE%2FmSENoHJJPwqJv38n%2F8%2BdEBsQ4juKoFov5RbSMne0uY3Z7lSQmlNQ84rTk4dywQ%3D%3D'
var url = 'http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getProductInfoSvc.do';



var makeJson = function(body){
    var xml = convert.xml2json(body,{compact:false, spaces:4});
    xml = JSON.parse(xml);
    var myjson = {
        "goodId":xml.elements[0].elements[0].elements[0].elements[0].elements[0].text,
        "goodName":xml.elements[0].elements[0].elements[0].elements[1].elements[0].text,
        "productEntpCode":xml.elements[0].elements[0].elements[0].elements[2].elements[0].text,
        "goodUnitDivCode":xml.elements[0].elements[0].elements[0].elements[3].elements[0].text,
        "goodBaseCnt":xml.elements[0].elements[0].elements[0].elements[4].elements[0].text,
        "goodSmlclsCode":xml.elements[0].elements[0].elements[0].elements[5].elements[0].text,
        "detailMean":xml.elements[0].elements[0].elements[0].elements[6].elements[0].text,
        "goodTotalCnt":xml.elements[0].elements[0].elements[0].elements[7].elements[0].text,
        "goodTotalDivCode":xml.elements[0].elements[0].elements[0].elements[8].elements[0].text
    }
    //console.log(myjson);
    myjson = JSON.stringify(myjson);
    return myjson;
}

var getGoodInfo = function(goodId){
    var queryParams = '?' + encodeURIComponent('ServiceKey') + SERVICE_KEY; /* Service Key*/
    queryParams += '&' + encodeURIComponent('goodId') + '=' + encodeURIComponent(goodId); /* */
    var goodJson;

    request({
        url: url + queryParams,
        method: 'GET'
    }, function (error, response, body) {
        goodJson = makeJson(body);
        console.log(goodJson);
    });
    return goodJson;
}

module.exports.getGoodInfo = getGoodInfo;