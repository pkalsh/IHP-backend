/**
 * product schema definition
 *
 * @date 2020-11-22
 * @author pkalsh
 */

const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId} } = Schema;
const GoodsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    entp_id: {
        type: String,
        required: true,
        ref: 'Store'
    },
    price: {
        type: Number,
        required: true
    },
    total_div: {
        type: String,
        default: 'g'
    },
    total: {
        type: Number,
        default: 1
    },
    product_entp: {
        type: String
    },
    detailed: {
        type: String,
        default: ''
    }
    
});

GoodsSchema.statics = {

}

module.exports = mongoose.model('goods', GoodsSchema)

module.exports = Schema;
