/**
 * product schema definition
 *
 * @date 2020-11-22
 * @author pkalsh
 * @updated 2020-11-23
 */

var SchemaObj = {};

SchemaObj.createSchema = function(mongoose) {
	
	var GoodsSchema = mongoose.Schema({
        name: { type: String, required: true, index: 'hashed' },
        priceInfo: [{
            price: { type: Number, default: 0 },
            entp: { type: mongoose.Schema.Types.ObjectId, ref: 'stores' }
        }],
        totalDiv: { type: String, default: 'g' },
        total: { type: Number, default: 1 },
        productEntp: { type: String },
        goodSmlType: { type: String, default: '' }
	});
	
	// 스키마에 인스턴스 메소드 추가
	GoodsSchema.methods = {
		addGoods: function(callback) {
            var self = this;

            this.validate((err) => {
                if (err) return callback(err);
                self.save(callback);
            })
        },
        updatePrice: function(entpId, price, callback) {
            var self = this;

        }
    }
    
	GoodsSchema.statics = {
		findByName: function(requestedName, callback) {
            return this.find({name: {$regex: requestedName}}, callback);
        },
        findAllGoods: function(type, callback) {
            this.find({ name: {$regex: requestedName}, goodSmlType:type })
                .sort({'name': 1})
                .exec(callback);
        },
        findById: function(id, callback) {
            this.find({_id: id})
                .populate('entp', 'name geometry tel address')
                .populate('priceInfo.entp')
                .exec(callback);
        }
	}

	return GoodsSchema;
};

module.exports = SchemaObj;
