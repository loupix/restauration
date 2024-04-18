'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PanierSchema = new Schema({
	client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
	pizzeria: {type: Schema.Types.ObjectId, ref: 'Pizzeria', required: true},
	commandes: [{type: Schema.Types.ObjectId, ref: 'Commande', required: true}],
	total: {type:Number},

	surPlace: {type:Boolean},
	livraison: {type:Boolean},

	regler: {type:Boolean},
	livrer: {type:Boolean},

	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Panier', PanierSchema);