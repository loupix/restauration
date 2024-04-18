'use strict';

const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt-nodejs'),
	uniqid = require('uniqid'),
	SALT_WORK_FACTOR = 10;


const config = require('../../config/environment'),
	path = require("path"),
    fs = require("fs");


const Produit = require("../Produit/produit"),
	Categorie = require("../Produit/categorie"),
	Ingredient = require("../Produit/ingredient"),
	Place = require("./place"),
	Calendrier = require("./calendrier"),
	Panier = require("../panier");

const extendSchema = require('mongoose-extend-schema');
var userAbstract = require("./user");

let RestaurantSchema = extendSchema(userAbstract, {
	enseigne:{type:String, default:null},
	open:{type:Boolean, default:false},
	distanceLivraison: {type:Number, default:20},
	admin:{
		username:{type:String, required:true},
		password:{type:String, required:true}
	},
	photo:{type:String},
	categories:[{type: Schema.Types.ObjectId, ref: 'Categorie'}],
	produits:[{type: Schema.Types.ObjectId, ref: 'Produit'}],
	ingredients:[{type: Schema.Types.ObjectId, ref: 'Ingredient'}],
	clients:[{type: Schema.Types.ObjectId, ref: 'Client'}],
	paniers:[{type: Schema.Types.ObjectId, ref: 'Panier'}],
	
	livraison: {
		livraison: {type:Boolean, default:false},
		distance: {type:Number, default:10},
		duree: {type:Number, default:10},
		paiement:{
			livraison: {type:Boolean, default:false},
			surPlace: {type:Boolean, default:false},
			enLigne:{type:Boolean, default:false},
		},
		tarif: {type:Number, default:0},
		minGratuit: {type:Number, default:0},
	},

	validation:{
		token: {type: String, default: null, select:false},
		validate: {type: Boolean, default:false, select:false},
		createdAt: {type: Date, default: Date.now, select:false},
		acceptedAt: {type: Date, default: null, select:false}
	},

	horraires: [{
		jour: {type:Date, default: Date.now, required: true},
		matin:{
			ouverture: {type:Date, default: null},
			fermeture: {type:Date, default: null},
		},
		apresMidi:{
			ouverture: {type:Date, default: null},
			fermeture: {type:Date, default: null},
		}
	}],
	fermetures: [{type:Date}]
	
});

RestaurantSchema.pre('save', function (next) {
	var obj = this;

	// generate token
	if (obj.validation.token==null)
		obj.validation.token = uniqid(12);

	
	// crypte password
	if (!obj.isModified('admin.password')) return next();


	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if (err) return next(err);

		bcrypt.hash(obj.admin.password, salt, null, function(err, hash) {
			if (err) return next(err);
			obj.admin.password = hash;
			next(obj);
		});
	});

});


RestaurantSchema.methods.comparePassword = function(candidatePassword, next) {
    bcrypt.compare(candidatePassword, this.admin.password, function(err, isMatch) {
        if (err) return next(err);
        if(!isMatch) return next(new Error("Mauvais username ou password"));
        return next();
    });
};


RestaurantSchema.methods.compareUsername = function(candidateUsername, next) {
	console.log(this.admin);

    if(candidateUsername == this.admin.username)
    	return next();
    return next(new Error("Mauvais username ou password"))
};



RestaurantSchema.methods.newLoginPass = function(username, password){
	var obj = this;
	
	return new Promise(function(resolve, reject){
		obj.admin.username = username;
		obj.admin.password = password;
		obj.save(function(err, obj){
			if(err) reject(err);
			resolve(obj);
		})
	})

}


RestaurantSchema.methods.validateToken = function(candidateToken, next) {
	if(this.validation.token == candidateToken){
		this.validation.validate = true;
		this.validation.acceptedAt = new Date();
		this.save();
		next();
	}else{next(new Error("Token différent"));}
};


RestaurantSchema.statics.getMe = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		fs.readFile(path.join(config.root, config.fileId), function(err, data){
			if (err) reject(err);
			var id = data.toString();
			obj.findById(id).then(function(restaurant){
				restaurant.getAdresse().then(function(adresse){
					restaurant.adresse = adresse;
					resolve(restaurant);
				}, function(err){
					reject(err);
				})
				
			}, function(err){
				reject(err);
			});
		});
	});
};


// Méthodes de classe

RestaurantSchema.methods.calculeLivraison = function(){
	var obj = this;

	// A Faire !!!!!!!!!!!!?????????????????????
};






RestaurantSchema.methods.isOpen = function(){
	var obj = this,
		now = new Date();

	var horraire = this.horraires.filter(function(d){
		return d.jour.getDay() == now.getDay();
	});
		
	if(horraire.length == 0)
		return false;
	
	horraire = horraire[0];

	if((horraire.matin.ouverture.getHours() <= now.getHours() && horraire.matin.fermeture.getHours() >= now.getHours()) 
		|| (horraire.apresMidi.ouverture.getHours() <= now.getHours() && horraire.apresMidi.fermeture.getHours() >= now.getHours()))
		return true;
	return false;

};

RestaurantSchema.methods.getAdresse = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Place.findById(obj.adresse).then(function(place){
			obj.adresse = place;
			resolve(place);
		}, function(err){
			reject(err);
		})
	});
};


RestaurantSchema.methods.getCalendrier = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var proms = obj.horraires.map(function(dat){
			return new Promise(function(res, rej){
				Calendrier.findById(dat).then(function(date){
					res(date);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(proms).then(function(allDates){
			obj.calendrier = allDates;
			resolve(allDates);
		}, function(err){
			reject(err);
		});
	})
};



RestaurantSchema.methods.getProduits = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.produits.map(function(prod){
			return new Promise(function(res, rej){
				Produit.findById(prod).then(function(produit){
					res(produit);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allProd){
			resolve(allProd);
		}, function(err){
			reject(err);
		});
	});
};




RestaurantSchema.methods.getClients = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.clients.map(function(cli){
			return new Promise(function(res, rej){
				Client.findById(cli).then(function(client){
					res(client);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allClient){
			resolve(allClient);
		}, function(err){
			reject(err);
		});
	});
};








RestaurantSchema.methods.addClient = function(client){
	var obj = this;
	return new Promise(function(resolve, reject){
		var nbClients = obj.clients.filter(function(c){return c._id == client._id});
		nbClients = nbClients.length;
		if(nbClients == 0){
			obj.constructor.update({_id:obj._id},
				{$push:{clients:client}},
				{safe: true, upsert: true}, function(err){
					console.log("Resto Save");
					if(err) reject(err);
					else resolve(obj);
			});
		}else
			resolve(obj);
	});
};





RestaurantSchema.methods.getCategories = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.categories.map(function(catId){
			return new Promise(function(res, rej){
				Categorie.findById(catId).then(function(categorie){
					res(categorie);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allCategorie){
			resolve(allCategorie);
		}, function(err){
			reject(err);
		});
	});
};




RestaurantSchema.methods.getPaniers = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.paniers.map(function(pan){
			return new Promise(function(res, rej){
				Panier.findById(pan).then(function(client){
					res(client);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allPanier){
			resolve(allPanier);
		}, function(err){
			reject(err);
		});
	});
};



RestaurantSchema.methods.getIngredients = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		var promises = obj.ingredients.map(function(ingId){
			return new Promise(function(res, rej){
				Ingredient.findById(ingId).then(function(ingredient){
					res(ingredient);
				}, function(err){
					rej(err);
				});
			});
		});

		Promise.all(promises).then(function(allIngredient){
			resolve(allIngredient);
		}, function(err){
			reject(err);
		});
	});
};

module.exports = mongoose.model('Restaurant', RestaurantSchema);
