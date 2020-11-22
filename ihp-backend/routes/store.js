var request = require('request');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();

// 매장 ID로 해당 매장 정보 조회

var url = 'http://openapi.price.go.kr/openApiImpl/ProductPriceInfoService/getStoreInfoSvc.do';

var queryParams = '?' + encodeURIComponent('entpId') + '=' + encodeURIComponent('115') + '&'
+ encodeURIComponent('ServiceKey') + 
'=95yvl4Q2Y6DIGgpJ8C%2FdqYE%2FmSENoHJJPwqJv38n%2F8%2BdEBsQ4juKoFov5RbSMne0uY3Z7lSQmlNQ84rTk4dywQ%3D%3D';

console.log(url);

request({
    url: url + queryParams,
    // url: url,
    method: 'GET'
}, function (error, response, body) {
    //console.log('Status', response.statusCode);
    //console.log('Headers', JSON.stringify(response.headers));
    //console.log('Reponse received', body);
    var xml = body;
    parser.parseString(xml, (err, result) => {

        // 매장명
        store_name = result['response']['result'][0]
        ['iros.openapi.service.vo.entpInfoVO'][0]['entpName'][0];
        
        console.log(store_name)

        // 매장 주소
        store_addr = result['response']['result'][0]
        ['iros.openapi.service.vo.entpInfoVO'][0]['plmkAddrBasic'][0]
        + result['response']['result'][0]
        ['iros.openapi.service.vo.entpInfoVO'][0]['plmkAddrDetail'][0];

        console.log(store_addr)

        // 매장 전화번호
        store_phone = result['response']['result'][0]
        ['iros.openapi.service.vo.entpInfoVO'][0]['entpTelno'][0];

        console.log(store_phone)

        
    });

});

