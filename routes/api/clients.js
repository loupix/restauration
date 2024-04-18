const express = require('express');
const router = express.Router();
const config = require('../../config/environment'),
	auth = require("../lib/authAdmin.js"),
	authClient = require("../lib/authClient.js");

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Place = require(path.join(config.root, "schema","User","place")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient")),
	Client = require(path.join(config.root, "schema","User","client"));

router.post('/get', function(req, res) {
	res.send()
});


router.get('/getMe', authClient,  function(req, res) {
	res.json({client:req.session.client, panier:req.session.panier});
});

router.get('/getAll', function(req, res) {
	// on prend la Restaurant enregistrer
	Restaurant.getMe().then(function(restaurant){

		// on charge les clients

		restaurant.getClients().then(function(clients){
			var proms = clients.map(function(cli){
				return new Promise(function(resolve, reject){
					cli.getAdresse().then(function(adr){
						cli.adresse = adr;
						resolve(cli);
					}, function(err){
						reject(err);
					});
				});
			});

			Promise.all(proms).then(function(clients){
				res.json(clients);
			}, function(err){
				res.status(409).json(err);
			});
			
		}, function(err){
			res.status(409).json(err);
		});
	}, function(err){
		res.status(409).json(err);
	});

});

router.put('/', function(req, res) {
	var client = req.body.client;
	Client.create({

	}).then(function(client){
		res.json(client);
	}, function(err){
		res.status(409).json(err);
	});
});

router.delete('/', auth, function(req, res) {
	var id = req.query.id;
	if(!id || id===undefined)
		res.status(404).json("Not found");

	Client.findOne({id}).then(function(client){
		client.remove().then(function(){
			
			Restaurant.getMe().then(function(restaurant){
				Restaurant.update({_id:restaurant._id},
					{$pull:{clients:client._id}}, {multi:false}, function(err){
						if(err) res.status(409).json(err)
						else res.status(200).json(true);
				});
			});


		}, function(err){
			res.status(409).json(err);
		});
	}, function(err){
		res.status(409).json(err);
	});
});

router.patch('/', function(req, res) {
	Client.findOne({_id:req.body.client._id}).then(function(clientDb){
		clientDb.nom = req.body.client.nom;
		clientDb.prenom = req.body.client.prenom;
		clientDb.livraison = req.body.client.livraison;
		clientDb.paiement = req.body.client.paiement;
		clientDb.email = req.body.client.email;
		clientDb.telephone = req.body.client.telephone;
		if(req.body.client.typePaiement !== undefined)
			clientDb.typePaiement = req.body.client.typePaiement;



		// Promesse qui rajoute une adresse au client
		// Si il en a mis une !

		var promClient = new Promise(function(resolve, reject){
			if(req.body.client.adresse !== undefined && req.body.client.adresse.googleId){
				Place.find({googleId:req.body.client.adresse.googleId}).then(function(place){
					if(place.length>0){
						clientDb.adresse = place[0];
						resolve(clientDb);
					}else{
						Place.create({adresse:req.body.client.adresse.adresse, ville:req.body.client.adresse.ville, codePostal:req.body.client.adresse.codePostal,
							latitude:req.body.client.adresse.latitude, longitude:req.body.client.adresse.longitude, googleId:req.body.client.adresse.googleId, createdAt:new Date()})
						.then(function(place){
							clientDb.adresse = place;
							resolve(clientDb);

						}, function(err){
							reject(err);
						})
					}
				}, function(err){
					reject(err);
				})
			}else{
				resolve(clientDb);
			}
		});

		promClient.then(function(clientDb){
			clientDb.save(function(err){
				if(err) res.status(500).json(err);
				req.session.client = clientDb;
				req.session.save(function(err){
					if(err) console.warn(err);
				});
				
				res.status(200).json(clientDb);
			});
		}, function(err){
			console.warn(err);
			res.status(409).json(err);
		});

	}, function(err){
		res.status(409).json(err);
	});
});

module.exports = router;