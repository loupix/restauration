const express = require('express');
const router = express.Router();
const config = require('../../config/environment'),
	auth = require("../lib/authAdmin.js");

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Taille = require(path.join(config.root, "schema","Produit","taille")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));


var multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty(),
	FileUploadController = require('../lib/FileUploadController');


router.post('/get', function(req, res) {
	Produit.findById(req.body.id).then(function(prod){
		prod.getInfos().then(function(prod){
			res.json(prod);
		}, function(err){
			res.status(409).json(err);
		});
		
	}, function(err){
		res.status(404).json(err);
	});
});


router.post('/getByCategorie', function(req, res) {
	Restaurant.getMe().then(function(restaurant){

		// on charge tout les produits
		
		restaurant.getProduits().then(function(allProduits){

			var produits = allProduits.filter(function(prod){
				return prod.categorie.toString() == req.body.categorie._id.toString();
			});

			// on charge les ingredients format text
			var promIngs = produits.map(function(prod){
				return prod.getIngredients();
			});

			Promise.all(promIngs).then(function(){
				var promTailles = produits.map(function(prod){
					return prod.getTailles();
				});

				Promise.all(promTailles).then(function(){

					var promCat = produits.map(function(prod){
						return prod.getCategorie();
					});

					Promise.all(promCat).then(function(){
						res.json(produits);
					}, function(err){
						res.status(404).json(err);
					})
					
				}, function(err){
					res.status(404).json(err);
				});
			}, function(err){
				res.status(404).json(err);
			});
			
		}, function(err){
			res.status(500).json(err);
		});

	}, function(err){
		res.status(500).json(err);
	});
});







router.get('/getAll', function(req, res) {
	// on prend la Restaurant enregistrer
	Restaurant.getMe().then(function(restaurant){

		// on charge tout les produits
		
		restaurant.getProduits().then(function(allProduits){
			// on charge les ingredients format text
			var promIngs = allProduits.map(function(prod){
				return prod.getIngredients();
			}).filter(function(prod){
				return prod.stock;
			});

			Promise.all(promIngs).then(function(){
				res.json(produits);
			}, function(err){
				res.status(500).json(err);
			});
		}, function(err){
			res.status(500).json(err);
		});

	}, function(err){
		res.status(500).json(err);
	});

});






router.put('/', auth, function(req, res) {
	var produit = req.body.produit;

	var promTailles = produit.tailles.map(function(taille){
		return new Promise(function(resolve, reject){
			if(taille.nom=='')
				resolve(false);
			Taille.create(taille).then(function(taill){
				resolve(taill);
			}, function(err){
				reject(err);
			});
		});
	});

	Promise.all(promTailles).then(function(tailles){

		var tailles = tailles.filter(function(t){return t;});

		var prodBdd = {nom:produit.nom, prix:produit.prix, photo:produit.photo, description:produit.description,  
			categorie:produit.categorie, ingredidents:produit.ingredients, base:produit.base}
		if(tailles.length > 0)
			prodBdd['tailles'] = tailles;



		Produit.create(prodBdd).then(function(produit){
				Restaurant.getMe().then(function(restaurant){

					Restaurant.update({_id:restaurant._id}, 
			            {$push:{produits:produit}},
			            {safe: true, upsert: true}, function(err){
			              if (err) res.status(500).json(err);
			              else res.status(200).json(produit);
			        });
			    }, function(err){
			    	console.warn(err);
					res.status(404).json(err);
				});

		}, function(err){
			console.warn(err);
			res.status(409).json(err);
		});

	}, function(err){
		console.warn(err);
		res.status(409).json(err);
	});

});







router.delete('/', auth, function(req, res) {
	var id = req.query.id;
	if(!id || id===undefined)
		res.status(404).send("Not found");
	
	Produit.findById(id).then(function(produit){
		produit.remove().then(function(){

			Restaurant.getMe().then(function(restaurant){
				Restaurant.update({_id:restaurant._id},
					{$pull:{produits:produit._id}}, {multi:false}, function(err){
						if(err) res.status(409).json(err)
						else res.status(200).json(true);
				});
			});

			
		}, function(err){
			res.status(500).json(err);
		});
	}, function(err){
		res.status(500).json(err);
	});
});








router.patch('/', auth, function(req, res) {


	// creer ou retourne la taille
	// console.log(req.body.produit.tailles);
	var promTailles = req.body.produit.tailles.map(function(taille){
		if(taille === undefined || taille.nom == '' || taille.prix == 0)
			return false;

		return new Promise(function(resolve, reject){
			if(taille !== undefined)
				resolve(taille);
			else{
				Taille.create({nom:taille.nom, prix:taille.prix}).then(function(taille){
					resolve(taille);
				}, function(err){
					reject(err);
				});
			};	
		});
	}).filter(function(t){return t;});

	Produit.findById(req.body.produit._id).then(function(produit){
		Promise.all(promTailles).then(function(tailles){
			produit.nom = req.body.produit.nom;
			produit.stock = req.body.produit.stock;
			produit.photo = req.body.produit.photo;
			produit.prix = req.body.produit.prix;
			produit.preparation = req.body.produit.preparation;
			if(tailles.length > 0)
				produit.tailles = tailles;
			produit.ingredients = req.body.produit.ingredients;
			produit.base = req.body.produit.base;
			produit.categorie = req.body.produit.categorie;
			produit.description = req.body.produit.description;
			produit.save().then(function(produit){
				res.json(produit);
			}, function(err){
				console.warn(err);
				res.status(500).json(err);
			});
		}, function(err){
			console.warn(err);
			res.status(500).json(err);
		});
		
	}, function(err){
		res.status(500).json(err);
	});
});




router.post("/upload", auth, multipartyMiddleware, FileUploadController.uploadFile);



module.exports = router;