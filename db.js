'use strict';

const fs = require('fs');
const mongoose = require('mongoose');

const environment = require('./environment');

let connectionInstance = null;

const initConnection = async () => {
  const connectConf = {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true,
    useUnifiedTopology: true,
  };

  if (environment.node_env === 'production') {
    connectConf.autoIndex = false
  }

  if (environment.database.cert) {
    connectConf.sslCA = fs.readFileSync(environment.database.cert);
  }

  connectionInstance = await mongoose.connect(environment.database.url, connectConf);


  return connectionInstance;
}

const getConnection = async () => {
  if (!connectionInstance) {
    await initConnection();
  }
  return connectionInstance.connection.db;
};


module.exports = getConnection;