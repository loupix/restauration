const express = require('express');
const router = express.Router();
const config = require('../../config/environment'),
	auth = require("../lib/authAdmin.js");

const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");


const Restaurant = require(path.join(config.root, "schema","User","restaurant")),
	Place = require(path.join(config.root, "schema","User","place")),
	Calendrier = require(path.join(config.root, "schema","User","calendrier")),
	Produit = require(path.join(config.root, "schema","Produit","produit")),
	Categorie = require(path.join(config.root, "schema","Produit","categorie")),
	Ingredient = require(path.join(config.root, "schema","Produit","ingredient"));


const multiparty = require('connect-multiparty'),
	multipartyMiddleware = multiparty(),
	FileUploadController = require('../lib/FileUploadController');



// Public

router.get('/getCalendrier', function(req, res){
	Restaurant.getMe().then(function(restaurant){
		restaurant.getCalendrier().then(function(dates){
			res.json(dates);
		}, function(err){
			res.status(409).json(err);
		});
	}, function(err){
		res.status(409).json(err);
	});
});



router.get('/getAdresse', function(req, res){
	Restaurant.getMe().then(function(restaurant){
		restaurant.getAdresse().then(function(adresse){
			res.json(adresse);
		}, function(err){
			res.status(409).json(err);
		});
	}, function(err){
		res.status(409).json(err);
	});
});





// Privée



router.get('/getMe', auth, function(req, res) {
	Restaurant.getMe().then(function(restaurant){
		restaurant.getAdresse().then(function(adr){
			restaurant.adresse = adr;
			restaurant.admin.password = null;
			restaurant.admin.username = null;
			res.json(restaurant);
		}, function(err){
			res.status(409).json(err);
		});

	}, function(err){
		throw err;
	});
});


router.patch('/', auth, function(req, res) {
	var restaurant = req.body.restaurant,
		place = restaurant.place,
		adresse = restaurant.adresse;


	// if(place !== null && place !== undefined){

	// 	Place.findById(adresse._id).then(function(resto){
	// 		if(resto.googleId != restaurant.googleId){
	// 			Place.update({id:adresse._id}, {adresse:place.name, ville:place.vicinity, codePostal:adresse.codePostal, 
	// 				latitude:adresse.latitude, longitude:adresse.longitude, googleId:adresse.googleId}, {}, 
	// 				function(err, place){
	// 					if(err) return res.status(500).json(err);
	// 				}
	// 			);
	// 		};
	// 	}, function(err){
	// 		return res.status(404).json(err);
	// 	});
	// };


	
	Restaurant.getMe().then(function(restaurant){
		restaurant.enseigne = req.body.restaurant.enseigne;
		restaurant.photo = req.body.restaurant.photo;
		restaurant.email = req.body.restaurant.email;
		restaurant.telephone = req.body.restaurant.telephone;
		restaurant.tempPreparation = req.body.restaurant.tempPreparation;
		restaurant.livraison = req.body.restaurant.livraison;
		restaurant.horraires = req.body.restaurant.horraires;
		restaurant.fermetures = req.body.restaurant.fermetures;


		// Promesse qui rajoute une adresse au restaurant
		// Si il en a mis une !
		var promRestoPlace = new Promise(function(resolve, reject){
			if(req.body.restaurant.adresse !== undefined && req.body.restaurant.adresse.googleId){
				Place.find({googleId:req.body.restaurant.adresse.googleId}).then(function(place){
					if(place.length>0){
						restaurant.adresse = place[0];
						resolve(restaurant);
					}else{
						Place.create({adresse:req.body.restaurant.adresse.adresse, ville:req.body.restaurant.adresse.ville, codePostal:req.body.restaurant.adresse.codePostal,
							latitude:req.body.restaurant.adresse.latitude, longitude:req.body.restaurant.adresse.longitude, googleId:req.body.restaurant.adresse.googleId, createdAt:new Date()})
						.then(function(place){
							restaurant.adresse = place;
							resolve(restaurant);

						}, function(err){
							reject(err);
						})
					}
				}, function(err){
					reject(err);
				})
			}else{
				resolve(restaurant);
			}
		});

		promRestoPlace.then(function(restaurant){
			if(req.body.restaurant.admin.username !== undefined && req.body.restaurant.admin.password !== null){
				var username = req.body.restaurant.admin.username,
					password = req.body.restaurant.admin.password;
				restaurant.newLoginPass(username, password).then(function(restaurant){
					restaurant.admin.username = null;
					restaurant.admin.password = null;
					req.session.destroy();
					res.status(200).json(restaurant);
				}, function(err){
					console.log(err);
					res.status(500).json(err);
				});
			}else{
				restaurant.save().then(function(restaurant){
					restaurant.admin.username = null;
					restaurant.admin.password = null;
					res.status(200).json(restaurant);
				}, function(err){
					console.log(err);
					res.status(500).json(err);
				})
			}
		}, function(err){
			res.status(500).json(err);
		});


		
	}, function(err){
		res.status(404).json(err);
	})
});






router.post("/upload", auth, multipartyMiddleware, FileUploadController.uploadFile);







// Dates / Horraires

router.put("/calendrier", auth, function(req, res){
	var date = req.body.date;
	Calendrier.create(date).then(function(calendrier){
		Restaurant.getMe().then(function(restaurant){
			Restaurant.update({_id:restaurant._id},
				{$push:{calendrier:calendrier}},
				{safe: true, upsert: true}, function(err){
					if(err) res.status(500).json(err);
					res.json(calendrier);
			}, function(err){
				res.status(500).json(err);
			});
		}, function(err){
			if(err) res.status(409).json(err);
		});
	}, function(err){
		if(err) res.status(409).json(err);
	});
});


router.delete("/calendrier", auth, function(req, res){
	var date = req.body.date;
	Calendrier.findById(date._id).then(function(calendrier){
		calendrier.remove().then(function(){
			res.status(200);
		}, function(err){
			res.status(500).json(err);
		});
	}, function(err){
		if(err) res.status(404).json(err);
	})
});


router.patch("/calendrier", auth, function(req, res){
	var date = req.body.date;
	Calendrier.update({id:date._id}, {
		jour:date.jour,
		matin:date.matin,
		apresMidi:date.apresMidi
	}, {safe: true, upsert: true}, function(err){
		if(err) res.status(500).json(err);
		res.status(200);
	});
});







// Dates de fermeture

router.put("/fermeture", auth, function(req, res){
	try{
		var fermeture = new Date(req.body.fermeture);
	}catch(e){
		throw e;
	};


	Restaurant.getMe().then(function(restaurant){
		Restaurant.update({_id:restaurant._id},
			{$push:{calendrier:calendrier}},
			{safe: true, upsert: true}, function(err){
				if(err) res.status(500).json(err);
				res.json({error:false});
		}, function(err){
			if(err) res.status(409).json(err);
		});
	}, function(err){
		if(err) res.status(409).json(err);
	});


});


router.delete("/fermeture", auth, function(req, res){
	try{
		var fermeture = new Date(req.body.fermeture);
	}catch(e){
		throw e;
	};

	

});


router.patch("/fermeture", auth, function(req, res){
	try{
		var fermeture = new Date(req.body.fermeture);
	}catch(e){
		throw e;
	};

});

module.exports = router;