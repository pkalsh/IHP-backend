/**
 * store schema definition
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-23
 */

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {
	
	var StoreSchema = mongoose.Schema({
		entpId: { type: String, required: true },
		name: {	type: String, index: 'hashed', required: true },
		address: {	type: String, 'default':'' },
		postNo: { type: String, 'default': '' },
		tel: { type: String, 'default':'' },
		entpType: {	type: String, required: true },
		area: {	type: String, required: true, default: '' },
		areaDetail: { type: String,	required: true,	default: '' },

		geometry: {
			'type': {type: String, 'default': "Point"},
			coordinates: [{type: "Number"}]
		}
	});

	StoreSchema.index({geometry:'2dsphere'});
	
	StoreSchema.methods = {
		saveStore: function(callback) {
			this.validate((err) => {
				if (err) return callback(err);
				this.save(callback);
			})
		}
	}
	
	StoreSchema.statics = {
		searchStore: function(marketName, type, smallCtg, callback) {
			return this.find({name: {"$regex": marketName}, areaDetail: smallCtg, entpType: type}, callback);
		},
		findById: function(id, callback) {
			return this.find({"_id": id}, callback);
		},
		getAllStores: function(callback) {
			this.find({})
				.sort({'area': 1, 'areaDetail': 1})
				.exec(callback);
		},
		setGeometry: function(id, long, lat, callback) {
            var query = {_id: id};
            var update = {$set: {'geometry.coordinates': [long, lat]}};
			
			return this.findOneAndUpdate(query, update, callback);            
		},
		findCircle: function(centerLong, centerLat, radius, callback) {
			return this.find().where('geometry').within(
				{center: [parseFloat(centerLong), parseFloat(centerLat)],
					radius: parseFloat(radius/6371000),
					unique: true, spherical: true
				}).exec(callback);
		}
	}

	return StoreSchema;
};

module.exports = SchemaObj;