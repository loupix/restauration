'use strict';

const express = require('express');
const router = express.Router();

const config = require('../config/environment'),
	authClient = require("./lib/authClient.js"),
	jadeCompiler = require('./lib/jadeCompiler');

let Promise = require("bluebird");
const path = require("path"),
    fs = require("fs");


const nodemailer = require('nodemailer');
const EmailTemplate = require('email-templates').EmailTemplate;

const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Place = require(path.join(config.root, "schema","User","place")),
	Panier = require(path.join(config.root, "schema","panier")),
	Commande = require(path.join(config.root, "schema","commande")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie"))


/* GET home page. */



router.get('/', function(req, res) {
	Restaurant.getMe().then(function(restaurant){
		res.render('index', {req:req, title:restaurant.enseigne, restaurant:restaurant});
	}, function(err){
		res.err(404).send(err);
	});
});


router.post('/mailInfos', function(req, res) {
	let nom = req.body.nom,
		email = req.body.email,
		tel = req.body.tel,
		message = req.body.message;

	let transporter = nodemailer.createTransport();

	let html = "<html><body>Nom : "+nom+"<br />Email : "+email+"<br />Téléphone : "+tel+"<br />Message : "+message+"</body></html>";
	transporter.sendMail({
		from: 'Easy-Pizza <noreply@easy-pizza.fr>',
		to: "anthony.lacroix01@gmail.com",
		subject: "Nouveau message de easy-pizza",
		html: html
	}, function(err, rep){
		if(err){
			console.warn(err);
			res.status(500).send(err);
		}
		else res.send(rep);
	});
});


router.get('/demo', function(req, res) {
	res.render('demo', {req:req});
});


router.get('/accueil', function(req, res) {

	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");

	// on prend la restaurant qui est deja enregistrer

	Restaurant.getMe().then(function(restaurant){

		// Chargement de tout les produits de la restaurant

		restaurant.getProduits().then(function(allProduits){
			var categories = [],
				promCat = [];
			allProduits.forEach(function(prod){
				if(categories.indexOf(prod.categorie.toString()) === -1){
					categories.push(prod.categorie.toString());
					promCat.push(new Promise(function(resolve, reject){
						Categorie.findOne({_id:prod.categorie}).then(function(cat){
							resolve(cat);
						}, function(err){
							reject(err);
						})
					}));
				}
				
			});

			// Chargement de toutes les catégories de la restaurant

			Promise.all(promCat).then(function(allCat){
				
				// chargement des produits de la première catégorie
				allCat = allCat.filter(function(cat){
					return cat !== null;
				});

				var cat = allCat[0];
				

				// Rendus 
				var moment = require("moment");
				moment.locale("fr");

				res.render('client/accueil', { req:req, title: 'Accueil', 
					moment:moment,
					restaurant:restaurant, categories:allCat, catEncours:cat});


			}, function(err){
				console.log(err);
				res.status(500).render(err);
			});

		}, function(err){
			console.log(err);
			res.status(500).render(err);
		})


	}, function(err){
		console.log(err);
		res.status(500).render(err);
	})


	
});





router.get('/panier', authClient, function(req, res) {

	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");

	var panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;

	Restaurant.getMe().then(function(restaurant){
		panier.getCommandes().then(function(commandes){
			panier.commandes = commandes;
			panier.calculeTotal().then(function(total){

				panier.calculeDuree().then(function(dureeTotal){

					panier.total = total;
					// Rendus 
					res.render('client/panier', { req:req, title: 'Votre commande',
						restaurant:restaurant, panier:panier, client:client, dureeTotal:dureeTotal});
				}, function(err){
					console.warn(err);
					res.status(409).send(err);
				});

			}, function(err){
				console.warn(err);
				res.status(409).send(err);
			})
			
		}, function(err){
			console.warn(err);
			res.status(404).send(err);
		})

	}, function(err){
		console.warn(err);
		res.status(404).send(err);
	});

});




router.get('/choixPaiement', authClient, function(req, res) {
	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");

	var panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;

	res.render('client/choixPaiement', { req:req, title: 'Choix du paiement'});
});



router.get('/livraison', authClient, function(req, res) {
	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");

	var panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;

	res.render('client/livraison', { req:req, title: 'Vos coordonnées', client:client, restaurant:restaurant, panier:panier});
});



// router.post('/livraison', authClient, function(req, res){
// 	var panier = req.session.panier,
// 		restaurant = req.session.restaurant,
// 		client = req.session.client;

// 	client.nom = req.body.nom;
// 	client.prenom = req.body.prenom;
// 	client.telephone = req.body.phone;
// 	client.email = req.body.email;

// 	if(!client.paiement.enLigne)
// 		client.typePaiement = req.body.paiement;



// 	//// Send Email
// 	panier.getCommandes().then(function(cmds){

// 		panier.calculeTotal().then(function(totalMontant){

// 			var templateDir = path.join(config.root, 'views', 'email','commande.jade');
// 			var options = {client:client, restaurant:restaurant, panier:panier};
// 			console.log(panier);
// 			console.log(client);

// 			jadeCompiler.compile(templateDir, options, function(err, html){
// 				if(err){
// 					console.warn(err);
// 					res.status(500).send(err);
// 				}

// 				console.log(html);
// 				 // Sending
// 				transporter.sendMail({
// 					from: 'Peon <noreply@peon.fr>',
// 					to: restaurant.email,
// 					subject: "Nouvelle commande",
// 					html: html
// 				}, function(error, response){
// 					if(err){
// 						console.warn(err);
// 						res.status(500).send(err);
// 					}
// 					req.session.destroy();
// 					res.redirect("/validation");
// 				});
// 			});
// 		}, function(err){
// 			res.status(404).send(err);
// 		})
// 	}, function(err){
// 		res.status(404).send(err);
// 	})
// })



router.get('/validation', authClient, function(req, res) {
	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");

	var panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;

	req.session.destroy();
	// req.session.client = client;
	// req.session.save(function(err){
	// 	console.warn(err);
	// });

	Panier.findById(panier.id).then(function(panier){
		panier.calculeDuree().then(function(dureeTotal){
			res.render('client/validation', { req:req, title: 'Commande valider', client:client, restaurant:restaurant, 
				panier:panier, dureeTotal:dureeTotal});
		}, function(err){
			console.warn(err);
			req.status(404).send(err);
		});
	},function(err){
		console.warn(err);
		req.status(404).send(err);
	});

});




router.get('/dialogIngredient', authClient, function(req, res) {
	if (!req.xhr || req.headers.accept.indexOf('json') < -1)
		res.redirect("/");
	

	Restaurant.getMe().then(function(restaurant){
		restaurant.getIngredients().then(function(AllIngredients){
			Produit.findById(req.query.prodId).then(function(produit){
				produit.getIngredients().then(function(ingredients){
					// on a les ingredients du produit & Tout les ingredients
					var ingredientsIds = ingredients.map(function(ing){return ing.id;}),
						ingredientsBase = AllIngredients.filter(function(ing){return ing.base && ing.stock;}),
						ingredientsAll = AllIngredients.filter(function(ing){return !ing.base && ing.stock;});

					var ingredientsInner = {};
					ingredientsAll.forEach(function(ing){
						if(ingredientsIds.indexOf(ing.id) !== -1)
							ingredientsInner[ing.id] = true;
						else
							ingredientsInner[ing.id] = false;
					});

					// on récupére les tailles & on affiche
					produit.getTailles().then(function(tailles){
						res.render('dialog/ingredients', {req:req, tailles:tailles ,ingredientsBase:ingredientsBase, 
							ingredientsInner:ingredientsInner, ingredientsAll:ingredientsAll, produit:produit});
					}, function(err){
						console.log(err);
					});
					
				}, function(err){
					console.log(err);
				});
			}, function(err){
				console.log(err);
			});
		}, function(err){
			console.log(err);
		});
	}, function(err){
		console.log(err);
	});
});


module.exports = router;