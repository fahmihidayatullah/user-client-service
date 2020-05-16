require('rootpath')();
require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./component/error-handler');
const responder = require('./component/responder');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/login', require('./v1/users/users.controller'));
app.use('/users', require('./v1/users/users.controller'));
app.use('/clients', require('./v1/clients/clients.controller'));
app.use('/', require('./v1/index'));

app.use(errorHandler);
app.use(async (req, res) => {
	responder.sendResponse(res, false, 404, "Path not found", {
		method: req.method,
		path: req.path.toString(),
		message: `Cannot ${req.method.toString()} ${req.path}`
	});
});

const port = process.env.NODE_ENV === 'prod' ? (process.env.PORT_HTTP || 80) : (process.env.NODE_ENV === 'dev' ? (process.env.PORT_HTTP || 3000 ) : 4000 );
const server = app.listen(port, function () {
    console.log('This Service listening on port ' + port);
});

module.exports = app;