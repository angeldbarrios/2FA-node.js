'use strict';

const express = require('express');
const AuthUseCases = require('../use_cases/authUseCases');
const stream = require('stream');

module.exports = () => {
  const router = express.Router();
  const authUseCases = new AuthUseCases();

  // TODO: implement some mechanism to prevent massive registrations
  // from same IP, some captcha, etc

  router.post('/login', async (req, res, next) => {
    try {
      const { username, password, tfaToken } = req.body;
      const data = await authUseCases.login({ username, password, tfaToken });
      res.json({
        error: false,
        data
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/register', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const userInfo = await authUseCases.register({ username, password });
      res.status(201).json({
        error: false,
        data: userInfo
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/2fa/setup', async (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      const getqr = req.query.getqr === '1' || req.query.getqr === 'true' ? true : false;
      const data = await authUseCases.tfaSetup(token, getqr);
      if(data instanceof Buffer) {
        res.header('Content-Type', 'image/png');
        res.send(data);
      } else {
        res.json({
          error: false,
          data: data
        });
      }

    } catch (error) {
      next(error);
    }
  });

  router.post('/2fa/confirmation', async (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      const tfaToken = req.body.tfaToken;
      await authUseCases.tfaConfirmation(token, tfaToken);
      res.json({
        error: false,
        message: '2FA successfully confirmated'
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/2fa/verification', async (req, res, next) => {
    try {
      const token = req.headers['authorization'];
      const tfaToken = req.body.tfaToken;
      const loginData = await authUseCases.tfaValidation(token, tfaToken);

      res.json({
        error: false,
        data: loginData
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};