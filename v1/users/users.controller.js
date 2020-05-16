const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const sanitize = require('../../component/sanitize');
const responder = require('../../component/responder');

router.post('/register', sanitize(), register);
router.post('/forget/:parameter', sanitize(), forget);
router.post('/reset_password', sanitize(), resetPass); 
router.post('/change_password/:id', sanitize(), changePass); 
router.post('/', sanitize(), login);
router.post('/login', sanitize(), login);
router.get('/', sanitize(), getAll);
router.get('/data/:data/:id/:username?', sanitize(), data);
router.get('/client/:clientId', sanitize(), getByClientId);
router.get('/:id', sanitize(), getById);
router.put('/:id', sanitize(), update);
router.delete('/:id', sanitize(), _delete);

module.exports = router;

function data(req, res, next) {
    let username = req.params.username;
    if(!req.params.username){
        username = "";
    }
    userService.getData(req.params.id, username, req.params.data)
        .then(user => user ? responder.sendResponse(res, true, 200, "OK", user) : responder.sendResponse(res, true, 404, "User Not Found", {}))
        .catch(err => next(err));
}

function login(req, res) {
    if (!req.body.username || !req.body.password) {
        responder.sendResponse(res, false, 400, "Username or password is missing");
    } else {
        userService.login(req.body.username, req.body.password, function(user) {
            if (user.error) {
                responder.sendResponse(res, false, 404, "Login Failed, " + user.error);
            } else {
                responder.sendResponse(res, true, 200, "OK", user);
            }
        });
    }
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => responder.sendResponse(res, true, 200, "Insert user " + req.body.username + " successfully"))
        .catch(err => next(err));
}

function forget(req, res, next) {
    switch(req.params.parameter) {
        case "password":
            if (!req.body.username || !req.body.email || !req.body.no_hp) {
                responder.sendResponse(res, false, 400, "username, email or no_hp is missing");
            } else {
                userService.forgetPass(req.body.username, req.body.email, req.body.no_hp, function(token) {
                    if (token.error) {
                        responder.sendResponse(res, false, 404, "Change Request Failed, " + token.error);
                    } else {
                        responder.sendResponse(res, true, 200, "Valid Data, Please use token to reset password!", token);
                    }
                });
            }
          break;
        case "username":
            userService.forgetUser(req.body.email, req.body.no_hp)
                .then(() => responder.sendResponse(res, true, 200, "Your username has been successfully sent to your email"))
                .catch(err => next(err));
          break;
        default:
            responder.sendResponse(res, false, 400, "Please check your parameter");
    }
}

function changePass(req, res, next) {
    userService.changePass(req.params.id, req.body)
        .then(() => responder.sendResponse(res, true, 200, "Change password has been Successfully"))
        .catch(err => next(err));
}

function resetPass(req, res, next) {
    userService.resetPass(req.headers['x-consumer-custom-id'], req.headers['x-authenticated-userid'], req.body)
        .then(() => responder.sendResponse(res, true, 200, "The password reset request has been successfully"))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll(req.headers['x-consumer-custom-id'], req.headers['x-authenticated-scope'])
        .then(users => users.length>0 ? responder.sendResponse(res, true, 200, "OK", users) : responder.sendResponse(res, true, 404, "User Not Found", {}))
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? responder.sendResponse(res, true, 200, "OK", user) : responder.sendResponse(res, true, 404, "User Not Found", {}))
        .catch(err => next(err));
}

function getByClientId(req, res, next) {
    userService.getByClientId(req.params.clientId)
        .then(user => user.length>0 ? responder.sendResponse(res, true, 200, "OK", user) : responder.sendResponse(res, true, 404, "User Not Found", {}))
        .catch(err => next(err));
}

function update(req, res, next) {
    if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
        responder.sendResponse(res, false, 400, "Object Missing");
    } else {
        userService.update(req.params.id, req.body)
            .then(() => responder.sendResponse(res, true, 200, "Update User " + req.params.id + " Successfully"))
            .catch(err => next(err));
    }
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => responder.sendResponse(res, true, 200, "Delete User " + req.params.id + " Successfully"))
        .catch(err => next(err));
}
