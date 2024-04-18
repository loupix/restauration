const express = require('express');
const router = express.Router();
const config = require('../../config/environment');

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));

router.post('/get', function(req, res) {
	// on prend la Restaurant enregistrer
	Restaurant.getMe().then(function(restaurant){
		res.json(restaurant);
	}, function(err){
		throw err;
	});
});

router.get('/getAll', function(req, res) {

});

router.put('/add', function(req, res) {

});

router.delete('/del', function(req, res) {

});

router.patch('/modif', function(req, res) {

});

module.exports = router;