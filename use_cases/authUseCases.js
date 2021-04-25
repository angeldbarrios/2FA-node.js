'use strict';

const Joi = require('joi');
const QRCode = require('qrcode');
const authService = require('../services/authService');
const accessTokenService = require('../services/accessTokenService');

const baseSchemaMap = {
  username: Joi.string().max(255).alphanum().required(),
  password: Joi.string().max(255).required(),
  tfaToken: Joi.number(),
  authorationToken: Joi.string().max(1024).regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
  tfaToken: Joi.number().max(999999),
  getQrOption: Joi.boolean()
};

module.exports = class AuthUseCases {

  async login({ username, password, tfaToken }) {
    // Validate input data against schema
    this.validateSchema(
      this.generateSchemaObject(['username', 'password', 'tfaToken']),
      { username, password, tfaToken }
    );
    // Try to log in
    const user = await authService.loginUser(username, password);
    const responseInfo = {
      id: user._id.toString(),
      username: user.username,
      needs2FA: false,
    };

    if(user.with2FA === true) {
      responseInfo.needs2FA = true;
    }

    // generate JWT access token
    const accessToken = await accessTokenService.generate(responseInfo);

    return {
      ...responseInfo,
      accessToken: accessToken
    }
  }

  async register({ username, password }) {
    // Validate input data against schema
    this.validateSchema(
      this.generateSchemaObject(['username', 'password']),
      { username, password }
    );

    const userExists = await authService.checkIfUserExists(username);
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await authService.registerUser({ username, password });

    return user;
  }

  /**
   * Generate 2FA secret. After this secret has to be added to Google Authenticator 
   * or other similar and then be confirmated in order to enabled 2FA
   * @param {string} authorationToken JWT token
   * @param {boolean} getQrOption Determines if function returns buffer containing QR image to be scan for Google Authenticator.
   *  Not implemented
   */
  async tfaSetup(authorationToken, getQrAsImage) {
    // Validate input
    this.validateSchema(
      this.generateSchemaObject(['authorationToken']),
      { authorationToken }
    );

    const decoded = await accessTokenService.decode(authorationToken);
    const secretData = await authService.generateSecret();
    await authService.storeTfaSecret(decoded.id, secretData.secret);

    if(getQrAsImage) {
      const urlAsQrBuffer = await QRCode.toBuffer(secretData.url);
      return urlAsQrBuffer;
    } else {
      secretData.urlAsQr = await QRCode.toDataURL(secretData.url);
      return secretData;
    }

  }

  /**
   * First 2FA token validation. After this validation,s 2FA is enabled
   * @param {string} authorationToken JWT token
   * @param {string | number } tfaToken One Use Password for 2FA
   */
  async tfaConfirmation(authorationToken, tfaToken) {
    this.validateSchema(
      this.generateSchemaObject(['authorationToken', 'tfaToken']),
      { authorationToken, tfaToken }
    );

    const decoded = await accessTokenService.decode(authorationToken);
    const user = await authService.getUserById(decoded.id);
    if (user.with2FA === true) {
      throw new Error('User already has token 2fa enabled');
    }
    if (!user.tfaSecret) {
      throw new Error('User already has not requested tfa token');
    }

    const isTokenValid = authService.verifyTfaToken(user.tfaSecret, tfaToken);
    if (!isTokenValid) {
      throw new Error('Not valid token');
    }
    await authService.confirmTfa(user._id);
  }

  /**
   * Validate 2FA token when user has this option enabled 
   * @param {string} authorationToken JWT token
   * @param {string | number } tfaToken One Use Password for 2FA
   */
  async tfaValidation(authorationToken, tfaToken) {
    this.validateSchema(
      this.generateSchemaObject(['authorationToken', 'tfaToken']),
      { authorationToken, tfaToken }
    );

    const decoded = await accessTokenService.decode(authorationToken);
    if(decoded.needs2FA !== true) {
      throw new Error('No 2FA is setup');
    }

    const user = await authService.getUserById(decoded.id);
    if (user.with2FA === false) {
      throw new Error('User has not enable 2FA yet');
    }
    if (!user.tfaSecret) {
      throw new Error('User has not enable 2FA yet');
    }

    const isTokenValid = authService.verifyTfaToken(user.tfaSecret, tfaToken);
    if (!isTokenValid) {
      throw new Error('Not valid token');
    }
    

    const loginData = {
      id: decoded.id,
      username: decoded.username,
      needs2FA: false,
    };
    const accessToken = await accessTokenService.generate(loginData);

    return {
      ...loginData,
      accessToken: accessToken
    }
  }

  /**
  * Helper function to generate schema useful to create
  * dinamic Joi schema validations from base Schema Map
  * @param {array} fields Fields to take from Base Schema map
  * @returns {Joi.ObjectSchema<any>} Joi Schema object
  */
  generateSchemaObject(fields) {
    if (!Array.isArray(fields)) {
      throw new TypeError('fields must be an array');
    }

    const schemaMap = fields.reduce((acc, key) => {
      if (baseSchemaMap[key]) {
        acc[key] = baseSchemaMap[key];
      }
      return acc;
    }, {});
    return Joi.object(schemaMap)
  }

  /**
   * 
   * @param {Joi.ObjectSchema<any>} schema Joi Object Schema to be validated
   * @param {any} data data to be validated
   * @returns resulting value after 'data' param sanitization
   */
  validateSchema(schema, data) {
    const { error, value } = schema.validate(data);
    if (error) throw new Error(error);
    return value;
  }
}