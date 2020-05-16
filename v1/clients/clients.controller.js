const express = require('express');
const router = express.Router();
const clientService = require('./client.service');
const sanitize = require('../../component/sanitize');
const responder = require('../../component/responder');

router.post('/register', sanitize(), register);
router.get('/', sanitize(), getAll);
router.get('/:id', sanitize(), getById);
router.put('/:id', sanitize(), update);
router.delete('/:id', sanitize(), _delete);

module.exports = router;

function register(req, res, next) {
    clientService.create(req.body)
        .then(() => responder.sendResponse(res, true, 200, "Insert Client " + req.body.clientname + " Successfully"))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    clientService.getAll(function(clients) {
        if(!clients){
            responder.sendResponse(res, true, 404, "Data Not Found", {});
        } else {
            responder.sendResponse(res, true, 200, "OK", clients);
        }
    });
}

function getById(req, res, next) {
    clientService.getById(req.params.id)
        .then(client => client ? responder.sendResponse(res, true, 200, "OK", client) : responder.sendResponse(res, true, 404, "Client Not Found", {}))
        .catch(err => next(err));
}

function update(req, res, next) {
    if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
        responder.sendResponse(res, false, 400, "Object Missing");
    } else {
        clientService.update(req.params.id, req.body)
            .then(() => responder.sendResponse(res, true, 200, "Update Client " + req.params.id + " Successfully"))
            .catch(err => next(err));
    }
}

function _delete(req, res, next) {
    clientService.delete(req.params.id)
        .then(() => responder.sendResponse(res, true, 200, "Delete Client " + req.params.id + " Successfully"))
        .catch(err => next(err));
}