"use strict";

const express = require('express');
const environment = require('./environment');

const hpp = require('hpp');
const helmet = require('helmet');
const nocache = require('nocache');
const bodyParser = require('body-parser');
const connectMongoDB = require('./db');
// const requestLimiter = require('./middlewares/requestLimiterMiddleware');

const createServer = require('./utils/createServer');
const onServerListening = require('./utils/onServerListening');

const authController = require('./controllers/authController');


async function initServer() {
  const app = express();
  const port = environment.server.port || 3000;

  await connectMongoDB();
  const server = createServer(app);

  /** Global Middlewares */
  app.use(helmet());
  app.use(nocache());
  
  // app.use(requestLimiter()); // Limitar peticiones
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(hpp());

  /** Routes */
  app.use("/api/auth", authController());

  /** 404 errors */
  app.use((req, res, next) => {
    try {
      const err = new Error('Not found');
      next(err);
    } catch (error) {
      next(error);
    }
  });

  /** Manejo de errores */
  app.use((err, req, res, next) => {
    res.status(500);
    res.json({
      error: true,
      message: err.stack // solo simplicidad
    });

  });

  server.listen(port, onServerListening(port));
  return server;
}

module.exports = { initServer };