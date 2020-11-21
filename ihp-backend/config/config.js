
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
	    
	]
}