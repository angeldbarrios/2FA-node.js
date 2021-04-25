'use strict';

const jwt = require('jsonwebtoken');
const enviroment = require('../environment');
const JWT_SECRET_KEY = enviroment.jwtSecret;

module.exports = {
  generate(payload) {
    return new Promise(function (resolve, reject) {
      jwt.sign(
        payload,
        JWT_SECRET_KEY,
        {
          issuer: '2fa-google-authenticator',
          audience: '2fa-google-authenticator',
          expiresIn: '1h'
        },
        function (err, token) {
          if (err) return reject(err);
          resolve(token);
        });
    });
  },

  decode(accessToken) {
    return new Promise(function (resolve, reject) {
      jwt.verify(
        accessToken,
        JWT_SECRET_KEY,
        { 
          issuer: '2fa-google-authenticator', 
          audience: '2fa-google-authenticator'
        },
        function (err, decoded) {
          if (err) return reject(err);
          resolve(decoded);
        });
    })
  }
};