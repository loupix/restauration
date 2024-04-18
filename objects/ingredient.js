'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngredientSchema = new Schema({
	nom: {type:String, required: true},
	prix: {type:Number, required: true},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Pizza', IngredientSchema);