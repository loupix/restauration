const express = require('express');
const router = express.Router();
const config = require('../../config/environment'),
	auth = require("../lib/authAdmin.js");;

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));

router.post('/get', function(req, res) {
	Categorie.findOne({_id:req.body.id}).then(function(categorie){
		res.json(categorie);
	}, function(err){
		res.status(500).json(err);
	});
});

router.get('/getAll', function(req, res) {
	// on prend la Restaurant enregistrer
	Restaurant.getMe().then(function(restaurant){

		restaurant.getCategories().then(function(allCategorie){
			res.json(allCategorie);
		}, function(err){
			res.status(500).json(err);
		});

	}, function(err){
		res.status(500).json(err);
	});


});

router.put('/', auth, function(req, res) {
	Categorie.create({nom:req.body.categorie.nom}).then(function(categorie){
		Restaurant.getMe().then(function(restaurant){

			Restaurant.update({_id:restaurant._id}, 
	            {$push:{categories:categorie}},
	            {safe: true, upsert: true}, function(err){
	              if (err) res.status(500).json(err);
	              else res.json(categorie);
	        });

		}, function(err){
			res.status(409).json(err);
		});
			
	}, function(err){
		res.status(409).json(err);
	})
});

router.delete('/', auth, function(req, res) {
	var id = req.query.id;
	if(!id || id===undefined)
		res.status(404).send("Not found");
	Categorie.findById(id).then(function(categorie){
		categorie.remove().then(function(){
			
			Restaurant.getMe().then(function(restaurant){
				Restaurant.update({_id:restaurant._id},
					{$pull:{categories:categorie._id}}, {multi:false}, function(err){
						if(err) res.status(409).json(err)
						else res.status(200).json(false);
				});
			});

		}, function(err){
			res.status(409).json(err);
		});
	}, function(err){
		res.status(404).json(err);
	});
});

router.patch('/', auth, function(req, res) {
	var cat = req.body.categorie;
	Categorie.update({_id:cat._id}, {nom:cat.nom}, {safe: true, upsert: true}, function(err, cat){
		if(err) return res.status(409).json(err);
		res.json(cat);
	});
});

module.exports = router;