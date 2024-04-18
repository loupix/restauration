'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommandeSchema = new Schema({
	client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
	pizzeria: {type: Schema.Types.ObjectId, ref: 'Pizzeria', required: true},
	produit: {type: Schema.Types.ObjectId, ref: 'Produit', required: true},
	taille: {type: Schema.Types.ObjectId, ref: 'Taille', required: true},
	ingredients: [{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}],
	total: {type:Number},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Commande', CommandeSchema);