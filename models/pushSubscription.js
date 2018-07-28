const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const pushSchema = new Schema({
    endpoint: {
        type: String,
        trim: true,
    },
    expirationTime: {
        type: String,
        trim: true,
        default: null
    },
    keys: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
});

/**
 * Schema plugins
 */
pushSchema.plugin(mongoosePaginate);

const push = mongoose.model('push', pushSchema);

module.exports = push;