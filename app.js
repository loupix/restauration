'use strict';

const express = require('express');
const chalk = require('chalk');
const config = require('./config/environment');
let mongoose = require('mongoose');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.set('strictQuery', true);

if (config.seed) {require('./config/seed');}

var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io')(server, { serveClient: true });
// require('./config/sockets.js')(socket);

require('./config/express.js')(app);
app.use('/admin', require('./routes/admin.js'));
app.use('/api', require('./routes/api.js'));
app.use('/', require('./routes/client.js'));

server.listen(config.port, config.ip, function () {

  console.log(
    chalk.red('\nExpress server listening on port ')
    + chalk.yellow('%d')
    + chalk.red(', in ')
    + chalk.yellow('%s')
    + chalk.red(' mode.\n'),
    config.port,
    app.get('env')
  );

});

module.exports = server;
