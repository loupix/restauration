'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Float = require('mongoose-float').loadType(mongoose);

var Promise = require("bluebird");

var Ingredient = require("./ingredient"),
	Taille = require("./taille"),
	Categorie = require("./categorie");

var ProduitSchema = new Schema({
	nom: {type:String, required: true},
	description: {type:String, default:null},
	photo: {type:String, required: true},
	categorie: {type: Schema.Types.ObjectId, ref: 'Categorie', required: true},
	ingredients: [{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}],
	base: {type: Schema.Types.ObjectId, ref: 'Ingredient'},
	ingredientsTxt: {type:String},
	tailles: [{type: Schema.Types.ObjectId, ref: 'Taille'}],
	prix: {type:Number, required:true},
	preparation: {type:Number, default:30},
	stock: {type:Boolean, default: true},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
});


ProduitSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});



ProduitSchema.methods.getCategorie = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Categorie.findById(obj.categorie.toString()).then(function(cat){
			obj.categorie = cat;
			resolve(cat);
		}, function(err){
			reject(err);
		});
	});
};


ProduitSchema.methods.getIngredients = function(){
	var obj = this;
	return new Promise(function(resolve, reject){


		var promises = [];

		promises.push(
			new Promise(function(res, rej){
				if(!obj.base || obj.base === undefined) res(false);
				Ingredient.findById(obj.base.toString()).then(function(ingredient){
					res(ingredient);
				}, function(err){
					rej(err);
				});
			}));

		promises = promises.concat(obj.ingredients.map(function(ing){
			return new Promise(function(res, rej){
				Ingredient.findById(ing.toString()).then(function(ingredient){
					res(ingredient);
				}, function(err){
					rej(err);
				});
			});
		}));


		Promise.all(promises).then(function(allIng){
			var base = allIng[0];
			if(base) obj.base = base;
			allIng = allIng.filter(function(ing){return ing;});
			// allIng = allIng.filter(function(ing){return !ing.base;});
			obj.ingredients = allIng;
			obj.ingredientsTxt = allIng
					.filter(function(ing){return !ing.base;})
					.map(function(ing){return ing.nom;}).join(", ");
			if(obj.base) obj.ingredientsTxt = obj.base.nom+", "+obj.ingredientsTxt;
			resolve(allIng);
		}, function(err){
			reject(err);
		});
	});
};


ProduitSchema.methods.getTailles = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.tailles.map(function(tail){
			return new Promise(function(res, rej){
				Taille.findById(tail.toString()).then(function(taille){
					res(taille);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allTaille){
			obj.tailles = allTaille;
			resolve(allTaille);
		}, function(err){
			reject(err);
		});
	});
};



ProduitSchema.methods.getInfos = function(){
	var obj = this;
	return new Promise(function(resolve, reject){

		var promises = [
			obj.getIngredients(),
			obj.getTailles()
		];


		Promise.all(promises).then(function(data){
			var allIngs = data[0],
				tailles = data[1];

				obj.ingredients = allIngs;
				obj.ingredientsTxt = allIngs.map(function(ing){return ing.nom;}).join(", ");
				obj.tailles = tailles;

				resolve(obj);
		}, function(err){
			reject(err);
		});
	});
};

module.exports = mongoose.model('Produit', ProduitSchema);