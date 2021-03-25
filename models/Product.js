const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    }
})

module.exports = Product = mongoose.model('product', ProductSchema);
