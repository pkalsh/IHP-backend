/**
 * store schema definition
 *
 * @date 2020-11-22
 * @author pkalsh
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const StoreSchema = new Schema({
	name: {
		type: String,
		index: 'hashed', 
		'default':''
	},
	address: {
		type: String,
		'default':''
	},
	tel: {
		type: String, 
		'default':''
	},
	geometry: {
		'type': {type: String, 'default': "Point"},
		coordinates: [{type: "Number"}]
	},
	created_at: {
		type: Date, 
		index: {unique: false}, 
		'default': Date.now
	},
	updated_at: {
		type: Date, 
		index: {unique: false}, 
		'default': Date.now
	}
});

StoreSchema.index({geometry:'2dsphere'});
	
StoreSchema.path('geometry').validate((geometry) => {
	return geometry.length;
}, 'geometry 칼럼의 값이 없습니다.');

// static으로 매장 데이터와 관련한 메서드 정의
StoreSchema.statics = {

}

module.exports = mongoose.model('store', StoreSchema)

module.exports = Schema;

