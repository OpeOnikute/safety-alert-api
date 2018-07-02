const Entry = require('../models/entry');
const utils = require('../lib/utils');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

module.exports = {

    /**
     * @param res
     * @param entryId
     * @param sendError
     * @param options
     * @param callback
     */
    getEntryById: function (res, entryId, sendError, callback, options) {

        Entry.findById(entryId)
            .lean(options ? (options.lean ||false) : false)
            .exec()
            .then(entry => {

                if (!entry) {

                    if (sendError) {
                        utils.sendError(res, responseMessages.paramNotFound('entry'), responseCodes.paramNotFound, 404);
                        return;
                    }

                    callback(false);
                    return;
                }

                callback(entry);
            })
            .catch(err => {

                if (err) {

                    if (sendError) {
                        utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                        return;
                    }

                    callback(false);
                }
            });
    },

    /**
     * @param res
     * @param title
     * @param callback
     * @param options
     */
    getEntryByTitle: function (res, title, callback, options) {

        return new Promise((resolve, reject) => {
            Entry.findOne({'title': title})
                .lean(options ? (options.lean ||false) : false)
                .exec()
                .then(entry => {
                    if (!entry) {
                        return reject(null);
                    }
                    resolve(entry);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
};