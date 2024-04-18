'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require("bluebird");
var Produit = require("./produit");

var CategorieSchema = new Schema({
	nom: {type:String, required: true},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});

CategorieSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});


CategorieSchema.methods.getProduits = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Produit.find({categorie:obj}).then(function(produits){
			resolve(produits);
		}, function(err){
			reject(err);
		});
	})
};

module.exports = mongoose.model('Categorie', CategorieSchema);