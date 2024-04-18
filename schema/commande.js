'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Float = require('mongoose-float').loadType(mongoose);
const Promise = require("bluebird");

const Produit = require("./Produit/produit"),
	Taille = require("./Produit/taille"),
	Ingredient = require("./Produit/ingredient"),
	Panier = require("./panier");

var CommandeSchema = new Schema({
	client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
	restaurant: {type: Schema.Types.ObjectId, ref: 'Restaurant', required: true},
	produit: {type: Schema.Types.ObjectId, ref: 'Produit', required: true},
	taille: {type: Schema.Types.ObjectId, ref: 'Taille'},
	quantite: {type:Number, default:1},
	ingredients: {
		more:[{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}],
		less:[{type: Schema.Types.ObjectId, ref: 'Ingredient', required: true}]
	},
	base:{type: Schema.Types.ObjectId, ref: 'Ingredient'},
	total: {type:Float, default:0},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

CommandeSchema.pre('save', function (next) {
	var obj = this;
	obj.calculeTotal().then(function(total){
		obj.total = total;
		obj.updatedAt = new Date();
		next();
	}, function(err){
		next(err);
	})
});




CommandeSchema.methods.calculeTotal = function(){
	var obj = this,
		total = 0;
	return new Promise(function(resolve, reject){

		var proms = [
			obj.getProduit(),
			obj.getTaille(),
			obj.getIngredients()
		];

		Promise.all(proms).then(function(data){
			var produit = data[0],
				taille = data[1],
				ingredients = data[2];

			total += parseFloat(produit.prix);
			if(taille)
				total += parseFloat(taille.prix);

			var arrIngs = ingredients.more.map(function(ing){return parseFloat(ing.prix)});
			if(arrIngs.length>0)
				total += arrIngs.reduce(function(a,b){return a+b});

			// var arrIngs = ingredients.less.map(function(ing){return parseFloat(ing.prix)});
			// console.log(arrIngs);
			// if(arrIngs.length>0)
			// 	total -= arrIngs.reduce(function(a,b){return a+b});


			total = total * obj.quantite;

			resolve(total);

		},function(err){
			reject(err);
		})

	})
};





CommandeSchema.methods.getIngredients = function(){
	var obj = this;

	return new Promise(function(resolve, reject){

		var moreIngs = obj.ingredients.more.map(function(id){
			return new Promise(function(res, rej){
				Ingredient.findById(id).then(function(ing){
					res(ing);
				}, function(err){
					rej(err);
				});
			});
		});


		var lessIngs = obj.ingredients.less.map(function(id){
			return new Promise(function(res, rej){
				Ingredient.findById(id).then(function(ing){
					res(ing);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(moreIngs).then(function(moreIng){
			Promise.all(lessIngs).then(function(lessIng){
				obj.ingredients.more = moreIng;
				obj.ingredients.less = lessIng;
				resolve(obj.ingredients);
			}, function(err){
				reject(err);
			});
		}, function(err){
			reject(err);
		});	
	});
};


CommandeSchema.methods.getTaille = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		if(taille){
			Taille.findById(obj.taille).then(function(taille){
				resolve(taille);
			}, function(err){
				reject(err);
			});
		}else
			resolve(false);
	})
};



CommandeSchema.methods.getProduit = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Produit.findById(obj.produit).then(function(produit){
			produit.getInfos().then(function(prod){
				resolve(prod);
			}, function(err){
				reject(err);
			});
		}, function(err){
			reject(err);
		})
	})
};




CommandeSchema.methods.loadData = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var proms = [
			obj.getProduit(),
			obj.getTaille(),
			obj.getIngredients(),
			obj.calculeTotal()
		];



		Promise.all(proms).then(function(data){
			obj.produit = data[0];
			obj.taille = data[1];
			obj.ingredients = data[2];
			obj.total = data[3];

			resolve({produit:data[0], taille:data[1], ingredients:data[2], total:data[3], obj:obj});			
		}, function(err){
			reject(err);
		});
	});
}


module.exports = mongoose.model('Commande', CommandeSchema);