'use case';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true
  },

  password: {
    type: String,
    required: true
  },

  with2FA: {
    type: Boolean,
    default: false
  },

  tfaSecret: {
    type: String,    
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
