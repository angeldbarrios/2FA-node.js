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
      if(data instanceof stream.Readable) {
        stream.pipeline(data, res, function(err) {
          if(err) {
            next(err);
          }
        });
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

  return router;
};