'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
	adresse: {type:String, required: true},
	ville: {type:String, required: true},
	codePostal: {type:Number, required: true},
	latitude: {type:Number, required: true},
	longitude: {type:Number, required: true},
	googleId: {type:String},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

PlaceSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Place', PlaceSchema);