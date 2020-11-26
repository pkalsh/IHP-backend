
/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./store_schema', collection:'stores', schemaName: 'StoreSchema', modelName:'StoreModel'},
        {file:'./goods_schema', collection:'goods', schemaName:'GoodsSchema', modelName:'GoodsModel'}
	],
	route_info: [
		//{file:'filename', path:'url', method:'function_name', type:'method'}	 
		{file:'./goods', path:'/item/list', method: 'listGoods', type: 'post'},
		{file:'./goods', path:'/item/info', method: 'searchById', type: 'post'},
		{file:'./store', path:'/market/list', method: 'listStores', type: 'post'},
		{file:'./store', path:'/market/info', method: 'searchById', type: 'post'}
	]
}