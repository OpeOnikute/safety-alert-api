const utils = require('../lib/utils');
const constants = require('../constants/constants');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

module.exports = {

    /**
     * @param res
     * @param modelObj
     * @param saveErrorResponseMessage
     * @param saveErrorResponseCode
     * @param sendError
     * @param sendSuccess
     * @param callback
     */
    saveModelObj: function (res, modelObj, saveErrorResponseMessage, saveErrorResponseCode, sendError, sendSuccess, callback) {
        modelObj.save(function(err, model) {
            if (err) {
                if (sendError) {
                    utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
                    return;
                }

                callback(false);
                return;
            }

            if (!model) {

                if (sendError) {
                    utils.sendError(res, saveErrorResponseMessage, saveErrorResponseCode, 500);
                    return;
                }

                callback(false);
                return;
            }

            if (sendSuccess) {
                utils.sendSuccess(res, model);
                return;
            }

            callback(model);
        });
    },

    /**
     * Updates a model's fields dynamically
     * @param res
     * @param params
     * @param modelObj
     * @param skipUpdate
     * @param sendError
     * @param sendSuccess
     */
    updateModelObj: function (res, params, modelObj, skipUpdate, sendError, sendSuccess) {

        if (typeof params !== 'object'){
            utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500);
            return;
        }

        for (let key in params) {

            if (!params.hasOwnProperty(key)) continue;

            //make sure the user has that property. hasOwnProperty() does not work for some reason.
            if (typeof modelObj[key] === 'undefined') continue;

            if (skipUpdate.indexOf(key) < 0 ) {
                modelObj[key] = params[key];
            }
        }

        this.saveModelObj(res, modelObj, responseMessages.errorUpdating, responseCodes.errorUpdating, sendError || true, sendSuccess || true);
    }
};
