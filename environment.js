
module.exports = {
  node_env: process.env.NODE_ENV,

  jwtSecret: process.env.JWT_SECRET,

  server: {
    port: process.env.PORT || 3000,
    secure: process.env.HTTP_SECURE === 'true'
  },

  database: {
    url: process.env.MONGO_URI
  }
};