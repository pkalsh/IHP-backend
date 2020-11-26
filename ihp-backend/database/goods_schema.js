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
        goodId: { type: String },
        name: { type: String, index: 'hashed' },
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
    }
    
	GoodsSchema.statics = {
		findByName: function(requestedName, callback) {
            return this.find({name: {$regex: requestedName}}, callback);
        },
        findAllGoods: function(type, sortingCriterion, requestedName, callback) {
            this.find({ name: {$regex: requestedName}, goodSmlType:type })
                .populate('entp', 'name geometry address')
                .populate('priceInfo.entp')
                .sort({sortingCriterion: 1})
                .exec(callback);
        },
        findById: function(id, callback) {
            this.find({_id: id})
                .populate('entp', 'name geometry address')
                .populate('priceInfo.entp')
                .exec(callback);
        },
        sortPriceAsc: function(id, callback) { 
            this.aggregate([
            // Initial document match (uses index, if a suitable one is available)
                { $match: {
                    _id : id
                }},
            
                // Expand the scores array into a stream of documents
                { $unwind: '$priceInfo' },
    
                // Sort in descending order
                { $sort: {
                    'priceInfo.price': 1
                }}
            ]
            ).exec(callback);
        }
	}

	return GoodsSchema;
};

module.exports = SchemaObj;
