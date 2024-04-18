'use strict';

const express = require('express');
const router = express.Router();
const path = require("path"),
    fs = require("fs");
const auth = require("./lib/authAdmin.js"),
	config = require('../config/environment');


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));


// Anti Brute Force !!
const ExpressBrute = require('express-brute'),
	MongoStore = require('express-brute-mongo'),
	MongoClient = require('mongodb').MongoClient;



/*let store = new MongoStore(function (ready) {
	MongoClient.connect(config.mongo.uri, (err, db) => {
		if (err) throw err;
		ready(db.collection('bruteforce-store'));
	});
});

let bruteforce = new ExpressBrute(store, {
	freeRetries:10,
	failCallback:function(req, res, next, nextValidRequestDate){
		req.toastr.error("Trop d'essaie effectuer");
		let now = new Date();
		let delta_time = new Date(now - nextValidRequestDate);
		req.toastr.error("Prochaine tentative : "+delta_time.toTimeString());
		res.redirect("/admin");
	}
});*/



/* GET home page. */
router.get('/', function(req, res) {
	// if(req.session.isAuthenticated !== undefined && req.session.isAuthenticated == true)
	// 	res.redirect("/admin/index")
	res.render('admin/accueil', {req:req, title: 'Admin accueil' });
});

router.post('/', auth, function(req, res) {
	res.redirect("/admin/index");
});

// router.post('/', auth, function(req, res) {
// 	res.redirect("/admin/categorie");
// });

router.get('/index', auth, function(req, res) {
	res.render('admin/index', {req:req, title: 'Admin catégorie' });
});

router.get('/deconnect', auth, function(req, res) {
	req.session.destroy();
	res.redirect("/admin");
});
	
router.get('/categorie', auth, function(req, res) {
	res.render('admin/categories', {req:req, title: 'Admin catégorie' });
});

router.get('/produits', auth, function(req, res) {
	res.render('admin/produits', {req:req, title: 'Admin produits' });
});

router.get('/ingredients', auth, function(req, res) {
	res.render('admin/ingredients', {req:req, title: 'Admin ingrédients' });
});

router.get('/configuration', auth, function(req, res) {
	res.render('admin/configuration', {req:req, title: 'Admin configuration' });
});

router.get('/clients', auth, function(req, res) {
	res.render('admin/clients', {req:req, title: 'Admin liste clients' });
});



/// Dialog


router.get('/dialog/ajoutCategorie', auth, function(req, res) {
	res.render('dialog/ajoutCategorie', {req:req, title: 'Admin liste catégorie' });
});


router.get('/dialog/ajoutIngredient', auth, function(req, res) {
	res.render('dialog/ajoutIngredient', {req:req, title: 'Admin liste ingredients' });
});


router.get('/dialog/ajoutProduit', auth, function(req, res) {
	Restaurant.getMe().then(function(restaurant){
		restaurant.getIngredients().then(function(AllIngredients){
			var ingredientsBase = AllIngredients.filter(function(ing){return ing.base;}),
				ingredientsNext = AllIngredients.filter(function(ing){return !ing.base;});

			res.render('dialog/ajoutProduit', {req:req, ingredientsBase:ingredientsBase, ingredientsNext:ingredientsNext, title: 'Admin ajout produits' });
		}, function(err){
			console.log(err);
			res.status(404).send(err);
		});
	}, function(err){
		console.log(err);
		res.status(404).send(err);
	});

});


router.get('/dialog/modifProduit', auth, function(req, res) {
	res.render('dialog/modifProduit', {req:req, title: 'Admin modif produits' });
});


router.use(function(err, req, res, next){
	if(err){
		console.error(err.stack);
		if(req.toastr !== undefined)
			req.toastr.error(err.message);
		// res.status(500).send(err.message);
		res.redirect("/admin");
	}else{
		return next();
	};
})


module.exports = router;