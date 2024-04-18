'use strict';

var mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
var userAbstract = require("./User");

var ClientSchema = extendSchema(userAbstract, {
	
});

module.exports = mongoose.model('Client', ClientSchema);
