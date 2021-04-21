'use strict';

const chalk = require('chalk')
const environment = require('../environment');

module.exports = (port) => {
  const mode = environment.NODE_ENV === "production" ? "producción" : "desarrollo";
  const protocol = environment.server.HTTPS === true ? "HTTPS" : "HTTP";
  const message1 = `Servidor en modo ${mode} sobre ${protocol}`;
  const message2 =
    `################################################ \n` +
    `🛡️  Server listening on port: ${port} 🛡️ \n` +
    `################################################`;

  console.log(chalk.bold.yellow(message1));
  console.log(chalk.bold.green(message2));
}