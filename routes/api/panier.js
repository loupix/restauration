const express = require('express');
const router = express.Router();
const config = require('../../config/environment'),
	auth = require("../lib/authAdmin.js"),
	authClient = require("../lib/authClient.js"),
	jadeCompiler = require('../lib/jadeCompiler');

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs"),
	nodemailer = require('nodemailer');


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Client = require(path.join(config.root, "schema","User","client")),
	Place = require(path.join(config.root, "schema","User","place")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient")),
	Taille = require(path.join(config.root, "schema","Produit","taille")),
	Commande = require(path.join(config.root, "schema","commande")),
	Panier = require(path.join(config.root, "schema","panier"));


router.get("/",authClient, function(req, res){
	let panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;
	
	restaurant.admin.username = null;
	restaurant.admin.password = null;

	if(panier !== undefined && panier !== null){
		panier.getCommandes().then(function(cmds){
			panier.commandes = cmds;
			panier.calculeTotal().then(function(total){
				panier.total = total;
				res.status(200).json({panier:panier, client:client, restaurant:restaurant});
			}, function(err){
				res.status(409).json(err);
			})
			
		}, function(err){
			res.status(409).json(err);
		});
	}else {
		res.status(200).send("Nouveau panier enregistrer");
	}
	
});







router.post("/commande/", authClient, function(req, res){
	var commande = req.body.commande,
		panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;

	restaurant.admin.username = null;
	restaurant.admin.password = null;

	Commande.findById(commande._id).then(function(cmd){
		cmd.loadData().then(function(data){
			res.status(200).json(data.obj);
		}, function(err){
			res.status(500).json(err);
		})
	}, function(err){
		res.status(404).sjon({err:err});
	});
});







router.post("/sendMail/", authClient, function(req, res){
	let panier = req.body.panier,
		restaurant = req.session.restaurant,
		client = req.body.client;

	let transporter = nodemailer.createTransport();


	//// Send Email
	Restaurant.findById(restaurant._id).then(function(restaurant){

		Panier.findById(panier._id).then(function(panier){
			panier.getCommandes().then(function(cmds){
				panier.commandes = cmds;
				panier.calculeTotal().then(function(totalMontant){

					Client.findById(client._id).then(function(client){

						// Add Client
						restaurant.addClient(client).then(function(restaurant){console.log("Client Ajouté");}, function(err){console.warn(err);});

						var proClientAdr = new Promise(function(resolve, reject){
							if(client.adresse !== undefined){
								Place.findById(client.adresse).then(function(adresse){
									client.adresse = adresse;
									resolve(client);
								}, function(err){
									reject(err);
								});
							}else if(client.livraison.domicile) {
								reject("Pas d'adresse");
							}else{
								resolve(client);
							}
						});

						proClientAdr.then(function(client){
							
							var options = {client:client, restaurant:restaurant, panier:panier};

							jadeCompiler.compile("../views/email/commande", options, function(err, html){
								if(err){
									console.log(err);
									res.status(500).json(err);
								}

								console.log("Send Restaurant");

								// Sending Restaurant

								var promMailResto = new Promise(function(resolve, reject){
									transporter.sendMail({
										from: 'Pizzeria Innocenti <noreply@innocenti.fr>',
										to: restaurant.email,
										subject: "Nouvelle commande",
										html: html
									}, function(err, repResto){
										if(err) reject(err);
										else resolve(repResto);
									});
								});


								// Sending Client


								console.log("Send Client");


								var promMailClient = new Promise(function(resolve, reject){
									transporter.sendMail({
										from: 'Pizzeria Innocenti <noreply@innocenti.fr>',
										to: client.email,
										subject: "Votre commande",
										html: html
									}, function(err, repClient){
										if(err) reject(err);
										else resolve(repClient);
									});
								});


								// Testing


								Promise.all([promMailResto, promMailClient]).then(function(reps){

									res.status(200).json(reps);
								}, function(err){
									console.warn(err);
									res.status(500).json(err);
								});

							}, function(err){
								console.warn(err);
								res.status(500).json(err);
							});
						});

					}, function(err){
						res.status(404).json(err);
					});
				}, function(err){
					res.status(404).json(err);
				});
			}, function(err){
				res.status(404).json(err);
			});
		}, function(err){
			res.status(404).json(err);
		});
	}, function(err){
		res.status(404).json(err);
	});

});






router.put("/", authClient, function(req, res){
	var produit = req.body.produit,
		quantite = req.body.infos.quantite;
		taille = req.body.infos.taille;
		ingredientsSupp = req.body.infos.ingredients.more,
		ingredientsLess = req.body.infos.ingredients.less,
		panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;



	Produit.findById(produit._id).then(function(produit){

		// ingredients supplémentaires

		var promIngMore = ingredientsSupp.map(function(ing){
			return new Promise(function(resolve, reject){
				Ingredient.findById(ing._id).then(function(ingredient){
					resolve(ingredient);
				}, function(err){
					reject(err);
				});
			});
		});


		// ingredients en moins

		var promIngLess = ingredientsLess.map(function(ing){
			return new Promise(function(resolve, reject){
				Ingredient.findById(ing._id).then(function(ingredient){
					resolve(ingredient);
				}, function(err){
					reject(err);
				});
			});
		});

		// chargement des ingredients & taille

		Promise.all(promIngMore).then(function(moreIngs){
			Promise.all(promIngLess).then(function(lessIngs){




				if(taille){
					var tailProm = new Promise(function(resolve, reject){
						Taille.findById(taille).then(function(taill){
							var cmd = {restaurant:restaurant, produit:produit, base:produit.ingredients.base, 
								quantite:quantite, client:client, taille:taill};
							resolve(cmd);
						}, function(err){
							reject(err);
						});
					});
				}else{
					var tailProm = new Promise(function(resolve, reject){
						var cmd = {restaurant:restaurant, produit:produit, base:produit.ingredients.base, 
								quantite:quantite, client:client};
						resolve(cmd);
					});
				}



				tailProm.then(function(cmd){

					Commande.create(cmd).then(function(commande){
						Commande.update({_id:commande._id}, 
							{$set:{'ingredients.more':moreIngs, 'ingredients.less':lessIngs}},
							{safe:true, upsert: true, multi:true}, function(err){
								if(err) console.warn(err);
						

								// Commande.update({_id:commande._id}, 
								// 	{$push:{ingredients:{less:lessIngs}}},
								// 	{safe:true, multi:true}, function(err){
								// 		if(err) console.warn(err);
								// });

								Commande.findById(commande._id).then(function(commande){
									commande.calculeTotal().then(function(total){

										// on calcule le total de la commande

										commande.total = total;
										commande.save(function(err){
											if(err) return res.status(500).json(err);
											
											// et on l'ajoute au panier

											Panier.update({_id:panier._id}, 
												{$push:{commandes:commande}},
												{safe: true, upsert: true}, function(err){
													if(err) return res.status(409).json(err);
													
													Panier.findById(panier._id).then(function(panier){

														// on recalcule le total

														panier.calculeTotal().then(function(total){
															panier.total = total;


															panier.save(function(err){
																if(err) return res.status(500).json(err);

																req.session.panier = panier;
																req.session.save(function(err){
																	if(err) return res.status(500).json(err);
																	// on renvoie la commande
																	// le total sera recalculer par angular
																	commande.loadData().then(function(commande){
																		res.status(200).json(commande);
																	}, function(err){
																		console.warn(err);
																		res.status(500).json(err);
																	})
																	
																});
															});
															
														}, function(err){
															console.warn(err);
															res.status(500).json(err);
														});
													}, function(err){
														console.warn(err);
														res.status(500).json(err);
													});
													
											});
										});
									}, function(err){
										console.warn(err);
										res.status(500).json(err);
									});
								}, function(err){
									console.warn(err);
									res.status(500).json(err);
								});
							});
						}, function(err){
							console.warn(err);
							res.status(500).json(err);
						});
					}, function(err){
						console.warn(err);
						res.status(500).json(err);
					});

				}, function(err){
					console.warn(err);
					res.status(404).json(err);
				});
			}, function(err){
				console.warn(err);
				res.status(404).json(err);
			});
		}, function(err){
			console.warn(err);
			res.status(404).json(err);
		});
});














router.patch("/", authClient, function(req, res){
	var commande = req.body.commande,
		quantite = req.body.infos.quantite;
		taille = req.body.infos.taille;
		ingredientsSupp = req.body.infos.ingredients.more,
		ingredientsLess = req.body.infos.ingredients.less,
		panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;


	// ingredients supplémentaires

	var promIngMore = ingredientsSupp.map(function(ing){
		return new Promise(function(resolve, reject){
			Ingredient.findById(ing._id).then(function(ingredient){
				resolve(ingredient);
			}, function(err){
				reject(err);
			});
		});
	});


	// ingredients en moins

	var promIngLess = ingredientsLess.map(function(ing){
		return new Promise(function(resolve, reject){
			Ingredient.findById(ing._id).then(function(ingredient){
				resolve(ingredient);
			}, function(err){
				reject(err);
			});
		});
	});


	Promise.all(promIngMore).then(function(moreIngs){
		Promise.all(promIngLess).then(function(lessIngs){
			Taille.findById(taille).then(function(taill){

				// on modifie la commande

				Commande.update({_id:commande._id}, {quantite:quantite, ingredients:{more:moreIngs, less:lessIngs}, taille:taill},
					{safe: true, upsert: true, multi: true}, function(err){
						if(err) return res.status(409).json(err);

						Commande.findById(commande._id).then(function(commande){

							// on recalcule le prix
							commande.calculeTotal().then(function(total){
								commande.total = total;
								commande.save(function(err){
									if(err) return res.status(500).json(err);

									// on modifie le prix du panier
									Panier.findById(panier._id).then(function(panier){
										panier.calculeTotal().then(function(total){
											panier.total = total;
											req.session.panier = panier;
											req.session.save(function(err){
												if(err) console.log(err);
											});
											panier.save(function(err){
												if(err) return res.status(500).json(err);
												res.status(200).json(commande);
											})
										}, function(err){
											console.warn(err);
											res.status(500).json(err);
										})
									}, function(err){
										console.warn(err);
										res.status(404).json(err);
									})
								});
							}, function(err){
								console.warn(err);
								res.status(500).json(err);
							});
						}, function(err){
							console.warn(err);
							res.status(404).json(err);
						});
				});
			}, function(err){
				console.warn(err);
				res.status(404).json(err);
			});
		}, function(err){
			console.warn(err);
			res.status(500).json(err);
		});
	}, function(err){
		console.warn(err);
		res.status(500).json(err);
	});
});















router.delete("/", authClient, function(req, res){
	var id = req.query.id,
		panier = req.session.panier,
		restaurant = req.session.restaurant,
		client = req.session.client;


	Commande.findById(id).then(function(commande){

		Panier.update({_id:panier._id}, 
			{$pull:{commandes:commande._id}},
			{safe: true, multi:false}, function(err){
				if(err) res.status(500).json(err);

				commande.remove().then(function(){
				// on modifie le prix du panier
					Panier.findById(panier._id).then(function(panier){
						panier.calculeTotal().then(function(total){
							panier.total = total;
							req.session.panier = panier;
							req.session.save(function(err){
								if(err) console.log(err);
							});

							panier.save(function(err){
								if(err) res.status(500).json(err);
								res.status(200).json(panier);
							});
						}, function(err){
							console.log(err);
							res.status(500).json(err);
						})
					}, function(err){
						console.log(err);
						res.status(404).json(err);
					})
				});
		});
	}, function(err){
		console.log(err);
		res.status(404).json(err);
	})
});

module.exports = router;