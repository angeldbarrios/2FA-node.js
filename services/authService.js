'use strict';

const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {

  async checkIfUserExists(username) {
    const user = await User.findOne({ username: username }).lean();
    return user ? true : false;
  },

  async registerUser({ username, password }) {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ username, password: hash });
    await user.save();
    return {
      id: user._id.toString(),
      username: user.username,
      createdAt: user.createdAt
    }
  },

  async loginUser(username, password) {
    // TODO: Create log for cases
    const user = await User.findOne({ username: username }, 'username password tfaToken with2FA').lean();
    if (!user) {
      throw new Error('Incorrect credencials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error('Incorrect credencials');
    }

    delete user.password;
    return user;
  },

  async generateSecret(getQrOption) {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: 'Test123'
    });

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: 'Test123',
      encoding: 'base32',
    });

    const qrUrl = await QRCode.toDataURL(url);

    return {
      secret: secret.base32,
      qrData: qrUrl
    }
  },

  verifyTfaToken(secret, token) {
    const tokenValidates = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token
    });
    return tokenValidates;
  },

  async storeTfaSecret(userId, base32Secret) {
    const user = await User.findById(userId, 'with2FA');
    if (!user) {
      throw new Error('Internal error');
    }
    if (user.with2FA === true) {
      throw new Error('You already have 2FA enabled');
    }

    user.tfaSecret = base32Secret;
    await user.save();
  },

  async confirmTfa(userId) {
    await User.updateOne(
      { _id: userId },
      { $set: { with2FA: true } }
    );
  },

  async getUserById(userId) {
    const user = await User.findOne({ id: userId }, 'username with2FA tfaSecret').lean();
    if (!user) {
      throw new Error('User does not exist');
    }
    return user;
  }
};