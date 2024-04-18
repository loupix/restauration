'use strict';

module.exports = {
  ip: process.env.IP || undefined,
  mongo: {
    uri: 'mongodb://localhost/restaurant-prod',
    dbName: 'restaurant-prod'
  },
  port:8082,
  seed: false
};
