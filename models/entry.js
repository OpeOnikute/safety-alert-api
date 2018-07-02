const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const utils = require('../lib/utils');

const Schema = mongoose.Schema;

const entrySchema = new Schema({
    title: {
        type: String,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    uploadedBy: {
        type: String,
        trim: true,
        default: null
    },
    content: {
        type: String,
        unique: true
    },
    contentType: {
        type: String,
        enum: {
            values: ['image', 'video']
        }
    },
    location: {
        type: String
    },
    state: {
        type: String,
        default: null
    },
    status: {
        type: String,
        default: 'valid',
        enum: {
            values: ['valid', 'deleted']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }
}, { runSettersOnQuery: true });

/**
 * On every save...
 */
entrySchema.pre('save', function(next) {
    const entry = this;
    utils.setTimestamps(entry, next);
});

entrySchema.pre('findOneAndUpdate', function(next) {
    const entry = this;

    // update updateAt value
    const currentDate = new Date();
    entry.update({}, { $set: { updatedAt: currentDate } });
    next();
});

entrySchema.pre('find', function() {
    this.where({status: {$ne: ['deleted']}});
});

/**
 * Schema plugins
 */
entrySchema.plugin(mongoosePaginate);

const entry = mongoose.model('entry', entrySchema);

module.exports = entry;