require('dotenv').config()
const config = require('./config');
const mongoose = require('mongoose');
const options = {
  poolSize: 50,
  keepAlive: 15000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

const connectWithRetry = function() {
    return mongoose.connect(config.mongo.url, options, function(err) {
      if (err) {
        console.error('Failed to connect to mongo on startup - retrying in 5 sec');
        setTimeout(connectWithRetry, 5000);
      }
    });
  };

connectWithRetry();
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../v1/users/user.model'),
    Client: require('../v1/clients/client.model')
};
