'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Promise = require("bluebird");


const Produit = require("./Produit/produit"),
	Taille = require("./Produit/taille"),
	Ingredient = require("./Produit/ingredient"),
	Restaurant = require("./User/restaurant"),
	Commande = require("./commande");


var PanierSchema = new Schema({
	client: {type: Schema.Types.ObjectId, ref: 'Client', required: true},
	restaurant: {type: Schema.Types.ObjectId, ref: 'Restaurant', required: true},
	commandes: [{type: Schema.Types.ObjectId, ref: 'Commande'}],
	total: {type:Number},
	modePaiement:{type:String},

	surPlace: {type:Boolean},
	livraison: {type:Boolean},

	regler: {type:Boolean},
	livrer: {type:Boolean},

	createdAt: {type: Date},
	updatedAt: {type: Date}
});


PanierSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});


PanierSchema.methods.getCommandes = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var proms = obj.commandes.map(function(id){
			return new Promise(function(res, rej){
				Commande.findById(id).then(function(cmd){
					cmd.loadData().then(function(data){
						res(data.obj);
					}, function(err){
						rej(err);
					});
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(proms).then(function(cmds){
			obj.commandes = cmds;
			resolve(cmds);
		}, function(err){
			reject(err);
		});
	})
};




PanierSchema.methods.getClient = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Client.findById(obj.client).then(function(client){
			resolve(client);
		}, function(err){
			reject(err);
		});
	});
};




PanierSchema.methods.calculeTotal = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		obj.getCommandes().then(function(cmds){
			var total = 0;
			if(cmds.length>0){
				var total = cmds.map(function(cmd){return cmd.total; }).reduce(function(a,b){return a+b});
			}
			total = Math.round(total*100)/100;
			obj.total = total;
			resolve(total);
		}, function(err){
			reject(err);
		});
	});
};


PanierSchema.methods.calculeDuree = function(){
	var obj = this;
	var total = 0;
	return new Promise(function(resolve, reject){
		obj.getCommandes().then(function(cmds){
			total = cmds.map(function(cmd){
				return cmd.produit.preparation;
			});
			if(total.length > 0){
				total = total.reduce(function(a,b){return a+b;});
				total = Math.round(total / cmds.length);
			}
			resolve(total);
			// Restaurant.getMe().then(function(resto){
			// 	obj.getClient().then(function(client){
			// 		if(client.livraison.domicile)
			// 			total += resto.livraison.duree;
			// 		resolve(total);
			// 	}, function(err){
			// 		reject(err);
			// 	})
			// }, function(err){
			// 	reject(err);
			// })
		}, function(err){
			reject(err);
		});
	});
};

module.exports = mongoose.model('Panier', PanierSchema);