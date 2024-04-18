'use strict';

var mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
var userAbstract = require("./User");

var PizzeriaSchema = extendSchema(userAbstract, {
	produits:[{type: Schema.Types.ObjectId, ref: 'Produits'}],
	clients:[{type: Schema.Types.ObjectId, ref: 'Client'}],
	commandes:[{type: Schema.Types.ObjectId, ref: 'Commande'}],
	paiementEnLigne:{type:Boolean},
	paiementSurPlace:{type:Boolean},
	token: {type: String, default: null},
	acceptedAt: {type: Date}
});

module.exports = mongoose.model('Pizzeria', PizzeriaSchema);
