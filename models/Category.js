const mongoose = require('mongoose');
const Schema = mongoose.Schema

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = Category = mongoose.model('category', CategorySchema);
