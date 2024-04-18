const config = require('../../config/environment');
const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");

const Client = require(path.join(config.root, "schema","User","client")),
	Restaurant = require(path.join(config.root, "schema","User","restaurant"))
	Place = require(path.join(config.root, "schema","User","place"))
	Panier = require(path.join(config.root, "schema","panier"));


module.exports = function(req, res, next){

	Restaurant.getMe().then(function(restaurant){

		restaurant.open = restaurant.isOpen();

		let clientProm;
		if(!req.session.client){
			clientProm = new Promise(function(resolve, reject){
				Client.create({}, function(err, client){
					if(err) return reject(err);

					if(req.body !== undefined && req.body.client !== undefined && req.body.client.place !== undefined){
						let place = req.body.client.place;
						Place.create({adresse:place.adresse, ville:place.ville, codePostal:place.codePostal, 
						latitude:place.latitude, longitude:place.longitude, googleId:place.googleId}).then(function(place){
							client.adresse = place;
							client.save(function(err){
								if(err) console.warn(err);
								resolve(client);
							});
						}, function(err){
							reject(err);
						})
					}else{
						resolve(client);
					}
				});
			});
		}else{
			clientProm = new Promise(function(resolve, reject){
				Client.findById(req.session.client._id).then(function(client){
					if(req.body !== undefined && req.body.client !== undefined && req.body.client.place !== undefined){
						var place = req.body.client.place;
						Place.create({adresse:place.adresse, ville:place.ville, codePostal:place.codePostal, 
						latitude:place.latitude, longitude:place.longitude, googleId:place.googleId}).then(function(place){
							client.adresse = place;
							client.save(function(err){
								if(err) console.warn(err);
								resolve(client);
							});
						}, function(err){
							reject(err);
						})
					}else{
						resolve(client);
					}
				}, function(err){
					reject(err);
				});
			});
		}

		clientProm.then(function(client){
			if(!req.session.panier){
				var promPanier = new Promise(function(resolve, reject){
					Panier.create({client:client, restaurant:restaurant}, function(err, panier){
						if(err) return reject(err);
						resolve(panier);
					});
				});
			}else{
				var promPanier = new Promise(function(resolve, reject){
					Panier.findById(req.session.panier._id).then(function(panier){
						resolve(panier);
					}, function(err){
						reject(err);
					});
				});
			}

			promPanier.then(function(panier){
				req.session.restaurant = restaurant;
				req.session.panier = panier;
				req.session.client = client;
				req.session.save(function(err){
					if(err) return next(err);
					next();
				});
			}, function(err){
				next(err);
			})

		}, function(err){
			next(err);
		});
	}, function(err){
		next(err);
	});
};