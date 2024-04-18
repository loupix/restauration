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
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));



router.post('/get', function(req, res) {
	Ingredient.findById(req.body.id).then(function(ingredient){
		res.json(ingredient);
	}, function(err){
		res.status(404).json(err);
	});

});

router.get('/getAll', function(req, res) {
	// on prend la Restaurant enregistrer
	Restaurant.getMe().then(function(restaurant){

		// on charge et envoie tout les ingrédients 

		restaurant.getIngredients().then(function(ingredients){
			res.json(ingredients);
		}, function(err){
			res.status(500).json(err);
		})

	}, function(err){
		res.status(500).json(err);
	});
});

router.put('/', auth, function(req, res) {
	var nom = req.body.ingredient.nom,
		prix = req.body.ingredient.prix;

	Ingredient.create({nom: nom, prix:prix}).then(function(ingredient){
		Restaurant.getMe().then(function(restaurant){

			Restaurant.update({_id:restaurant._id}, 
	            {$push:{ingredients:ingredient}},
	            {safe: true, upsert: true}, function(err){
	              if (err) res.status(500).send(err);
	              else res.json(ingredient);
	        });

		}, function(err){
			res.status(409).send(err);
		});
			
	}, function(err){
		res.status(404).send(err);
	})
});

router.delete('/', auth, function(req, res) {
	var id = req.query.id;
	if(!id || id===undefined)
		res.status(404).send("Not found");

	Ingredient.findById(id).then(function(ingredient){
		ingredient.remove().then(function(){
			
			Restaurant.getMe().then(function(restaurant){
				Restaurant.update({_id:restaurant._id},
					{$pull:{ingredients:ingredient._id}}, {multi:false}, function(err){
						if(err) res.status(409).json(err)
						else res.status(200).json(true);
				});
			});

		}, function(err){
			res.status(500).json(err);
		});
	}, function(err){
		res.status(404).json(err);
	});
});

router.patch('/', auth, function(req, res) {
	Ingredient.findById(req.body.ingredient._id).then(function(ingredient){
		ingredient.nom = req.body.ingredient.nom;
		ingredient.prix = req.body.ingredient.prix;
		ingredient.stock = req.body.ingredient.stock;
		ingredient.base = req.body.ingredient.base;
		ingredient.save().then(function(){
			res.status(200).json(ingredient);
		}, function(err){
			res.status(500).json(err);
		})
		
	}, function(err){
		res.status(500).json(err);
	});
});

module.exports = router;