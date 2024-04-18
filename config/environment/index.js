'use strict';

var path = require('path');
var _ = require('lodash');

var all = {

  env: process.env.NODE_ENV || 'development',
  root: path.normalize(__dirname + '/../..'),
  port: process.env.PORT || 9000,
  seed: true,
  fileId:".restaurantId",
  userRoles: ['expired', 'user', 'admin', 'install'],

  mongo: {
    options: {
      useMongoClient: true
    }
  },

  secrets: {
    session: process.env.SESSION_SECRET || '$2a$12$qpyEJ6KEJqQx.MwWyKhfIOWIxCuqIVN3FkcehpLSNsnF.2.OmZd9a'
  }
};

module.exports = _.merge(all, require('./' + all.env + '.js'));
