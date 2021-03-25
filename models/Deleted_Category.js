const mongoose = require('mongoose');
const Schema = mongoose.Schema

const Deleted_CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
})

module.exports = Deleted_Category = mongoose.model('deleted_category', Deleted_CategorySchema);
