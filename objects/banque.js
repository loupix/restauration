'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BanqueSchema = new Schema({
	
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Banque', BanqueSchema);