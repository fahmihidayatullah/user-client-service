module.exports = errorHandler;
const responder = require('./responder');

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        if (err.includes('Not Found')) {
            return responder.sendResponse(res, false, 404, err, {});
        } else {
            return responder.sendResponse(res, false, 400, err);
        }
    }
    
    if (err.name === 'ValidationError') {
        return responder.sendResponse(res, false, 400, err.message);
    }

    return responder.sendResponse(res, false, 500, err.message);
}