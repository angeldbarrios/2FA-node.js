  
'use strict';

const environment = require('../environment');

function getServer(app) {
  let server;
  if (environment.server.secure === true) {
    /** Servidor inicia con https */
    const fs = require('fs');
    const https = require("https");
    server = https.createServer(
      {
        key: fs.readFileSync(environment.server.KEY),
        cert: fs.readFileSync(environment.server.CERT),
      },
      app
    );
  } else {
    const http = require("http");
    server = http.createServer(app);
  }
  return server;
}

module.exports = getServer;