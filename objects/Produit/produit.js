'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProduitSchema = new Schema({
	nom: {type:String, required: true},
	photo: {type:String, required: true},
	categorie: {type: Schema.Types.ObjectId, ref: 'Categorie', required: true},
	ingredients: [{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}],
	tailles: [{type: Schema.Types.ObjectId, ref: 'Taille', required: true}],
	prix: {type:Number},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Produit', ProduitSchema);