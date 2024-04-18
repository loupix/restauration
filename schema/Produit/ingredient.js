'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose);

var IngredientSchema = new Schema({
	nom: {type:String, required: true},
	prix: {type:Float, required: true},
	stock:{type:Boolean, default:true},
	base:{type:Boolean, default:false},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

IngredientSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Ingredient', IngredientSchema);