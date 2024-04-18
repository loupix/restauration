'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema;

const config = require('../../config/environment'),
	path = require("path"),
    fs = require("fs");


const Produit = require("../Produit/produit"),
	Ingredient = require("../Produit/ingredient"),
	Client = require("./client"),
	Place = require("./place"),
	Panier = require("../panier");


let CalendrierSchema = new Schema({
	jour: {type:Date, default: Date.now, required: true},
	matin:{
		ouverture: {type:Date, default: null},
		fermeture: {type:Date, default: null},
	},
	apresMidi:{
		ouverture: {type:Date, default: null},
		fermeture: {type:Date, default: null},
	}
});


module.exports = mongoose.model('Calendrier', CalendrierSchema);