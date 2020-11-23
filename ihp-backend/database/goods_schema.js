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
        name: {
            type: String,
            required: true,
            index: 'hashed'
        },
        price: {
            type: Number,
            //required: true,
            default: 0
        },
        totalDiv: {
            type: String,
            default: 'g'
        },
        total: {
            type: Number,
            default: 1
        },
        productEntp: {
            type: String
        },
        goodSmlType: {
            type: String,
            default: ''
        }
	});
	
	// 스키마에 인스턴스 메소드 추가
	GoodsSchema.methods = {
		addGoods: (callback) => {
            var self = this;

            this.validate((err) => {
                if (err) return callback(err);
                self.save(callback);
            })
        }
    }
    
	GoodsSchema.statics = {
		findByName: function(requestedName, callback) {
            return this.find({name: {$regex: requestedName}}, callback);
        },
        findAllGoods: function(callback) {
            this.find({})
                .sort({"name":1})
                .exec(callback);
        },
        listPerPage: function(options, callback) {
            this.find(criteria)
				.sort({"name": 1})
				.limit(Number(options.perPage))
				.skip(options.perPage * options.page)
				.exec(callback);
        }
	}

	return GoodsSchema;
};

module.exports = SchemaObj;
