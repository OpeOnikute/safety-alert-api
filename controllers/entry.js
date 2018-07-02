const Entry = require('../models/entry');

const utils = require('../lib/utils');

const baseController = require('../controllers/base');
const responseMessages = require('../constants/responseMessages');
const responseCodes = require('../constants/responseCodes');

const entryHandler = require('../handlers/entryHandler');

module.exports = {

    /**
     * Endpoint to create a new entry
     * @param req
     * @param res
     * @returns {*}
     */
    createEntry: (req, res) => {

        let params = req.body;

        // req params validation for required fields
        req.checkBody('title', 'The title provided is invalid').isText();
        req.checkBody('description', 'The description provided is invalid').isText();
        req.checkBody('uploadedBy', 'uploadedBy provided is invalid').optional().isText();
        req.checkBody('content', 'The content provided is invalid').isText();
        req.checkBody('contentType', 'The content type provided is invalid').inArray(['video', 'image']);
        req.checkBody('location', 'The location provided is invalid.').isText();
        req.checkBody('state', 'The state provided is invalid.').optional().isText();

        // validate entry input
        req
            .getValidationResult()
            .then(result => {

                if (!result.isEmpty()) {
                    return utils.sendError(res, responseMessages.invalidParams, responseCodes.invalidParams, 400, result.array());
                }

                let createEntry = function () {

                    const entry = new Entry({
                        title: params.title,
                        description: params.description,
                        uploadedBy: params.uploadedBy,
                        content: params.content,
                        contentType: params.contentType,
                        location: params.location,
                        state: params.state
                    });

                    baseController.saveModelObj(res, entry, responseMessages.paramsNotCreated('entry'),
                        responseCodes.paramsNotCreated, true, true);
                };

                //Check if a entry with that email already exists
                entryHandler.getEntryByTitle(res, params.title)
                    .then(existingEntry => {

                        if (existingEntry) {
                            return utils.sendError(res,responseMessages.paramAlreadyExists('entry', 'title'), responseCodes.paramAlreadyExists, 400);
                        }

                        createEntry();
                    })
                    .catch(err => {
                        //doesn't already exist
                        createEntry();
                    });
            });
    },

    getAllEntries: (req, res) => {
        Entry.find({})
            .exec()
            .then((entries) => {

                if (!entries.length) {
                    return utils.sendError(res, responseMessages.noParamFound('entry'), responseCodes.noParamFound, 400);
                }

                utils.sendSuccess(res, entries);
            })
            .catch((err) => {
                return utils.sendError(res, responseMessages.internalServerError, responseCodes.internalServerError, 500, err);
            });
    },

    /**
     * Endpoint to update a entry's details
     * @param req
     * @param res
     */
    updateEntry: (req, res)  => {

        const entryId = req.params.entryId;

        const skipUpdate = ['status', 'createdAt', 'updatedAt'];

        req.checkParams('entryId', '%0 isn\'t a valid ID').isMongoId();

        req
            .getValidationResult()
            .then(result => {

                if (!result.isEmpty()) {
                    return utils.sendError(res, responseMessages.invalidParams, responseCodes.invalidParams, 400, result.array());
                }

                entryHandler.getEntryById(res, entryId, true, (entry) => {

                    if (!entry) {
                        return;
                    }

                    baseController.updateModelObj(res, req.body, entry, skipUpdate, true, true);
                });
            });
    },

    /**
     * Endpoint to get a entry's details by id
     * @param req
     * @param res
     */
    getEntryById: (req, res) => {

        const entryId = req.params.entryId;

        req.checkParams('entryId', '%0 isn\'t a valid ID').isMongoId();

        req
            .getValidationResult()
            .then(result => {

                if (!result.isEmpty()) {
                    return utils.sendError(res, responseMessages.invalidParams, responseCodes.invalidParams, 400, result.array());
                }

                entryHandler.getEntryById(res, entryId, true, function (entry) {

                    if (!entry) return;

                    utils.sendSuccess(res, entry);
                });
            });
    }
};