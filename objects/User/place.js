'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
	adresse: {type:String, required: true},
	ville: {type:String, required: true},
	codePostal: {type:String, required: true},
	latitude: {type:SchemaTypes.Double, required: true},
	longitude: {type:SchemaTypes.Double, required: true},
	
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Place', PlaceSchema);