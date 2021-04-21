'use strict';

require('dotenv').config();

const app = require('./app');

async function main() {
  try {
    await app.initServer();    
  } catch (error) {
    /** @TODO Some logs */
    console.error(error)
  }
}

main();