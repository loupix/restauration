'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PizzaSchema = new Schema({
	nom: {type:String, required: true},
	photo: {type:String, required: true},
	ingredients: [{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}]
	prix: {type:Number},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Pizza', PizzaSchema);