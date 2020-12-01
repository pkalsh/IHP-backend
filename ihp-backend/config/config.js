
/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'users7', schemaName:'UserSchema', modelName:'UserModel'}
        ,{file:'./coffeeshop_schema', collection:'coffeeshop', schemaName:'CoffeeShopSchema', modelName:'CoffeeShopModel'}
	],
	route_info: [
	    //{file:'filename', path:'url', method:'function_name', type:'method'}	 
	    
	],
	API_KEY : "l7xx7aef2b3562da4bc48754861c040880ce" 
}