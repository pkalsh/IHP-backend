/**
 * store schema definition
 *
 * @date 2020-11-22
 * @author pkalsh
 */

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var StoreSchema = mongoose.Schema({
	    name: {type: String, index: 'hashed', 'default':''},
	    address: {type: String, 'default':''},
	    tel: {type: String, 'default':''},
	    geometry: {
	    	'type': {type: String, 'default': "Point"},
	    	coordinates: [{type: "Number"}]
	    },
	    created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	    updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
	});
	
	StoreSchema.index({geometry:'2dsphere'});

	// static으로 매장 데이터와 관련한 메서드 정의

	return StoreSchema;
};

module.exports = Schema;

