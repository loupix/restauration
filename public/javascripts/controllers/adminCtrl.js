myApp.controller("accueilAdminCtrl", ['$scope', function($scope){


}]);


myApp.controller("categorieAdminCtrl", ['$scope', 'CategorieService', '$mdDialog', function($scope, $CategorieService, $mdDialog){
	$scope.categories = [];
	$scope.categoriesAfficher = [];
	$scope.search = "";

	$scope.init = function(){
		$CategorieService.getAll().then(function(categories){
			$scope.categories = categories;
			angular.copy($scope.categories, $scope.categoriesAfficher);
		}, function(error){
			toastr.error(error.statusTxt);
		});
	};


	$scope.delete = function(categorie){
		$CategorieService.del(categorie).then(function(rep){
			if(rep.error)
				return toastr.error(rep.error.statusTxt);

			$scope.init();
			toastr.success("Catégorie supprimé");
			
		}, function(error){
			toastr.error(error.statusTxt);
		});
	};



	$scope.onSearch = function(){
		$scope.categoriesAfficher = $scope.categories.filter(function(cat){
			return cat.nom.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
		});
	}








	////// Dialog Categorie supp //////






	$scope.showDialog = function(ev, categorie, type){
		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: '/admin/dialog/ajoutCategorie',
	      parent: angular.element(document.body),
	      locals: {parentScope:$scope, CategorieService:$CategorieService, categorie:categorie, type:type},
	      targetEvent: ev,
	      clickOutsideToClose:true
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	};



	function DialogController($scope, $mdDialog, parentScope, CategorieService, categorie, type) {

		$scope.categorie = {};
		$scope.type = type;
		$scope.parentScope = parentScope;

		angular.copy(categorie, $scope.categorie);
		$scope.categorie = $scope.categorie === false ? {nom:""} : $scope.categorie;
		


		$scope.valide = function(){
			if($scope.type=="ajouter"){
				CategorieService.add($scope.categorie).then(function(categorie){
					$scope.parentScope.init();
					$mdDialog.hide();
					toastr.success("Catégorie ajouté");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else if(type=="modifier"){
				CategorieService.modif($scope.categorie).then(function(categorie){
					$scope.parentScope.init();
					$mdDialog.hide();
					toastr.success("Catégorie modifié");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else{
				toastr.error("mauvais choix");
			}
		};

		$scope.hide = function() {
		  $mdDialog.hide();
		};

		$scope.cancel = function() {
		  $mdDialog.cancel();
		};

		$scope.answer = function(answer) {
		  $mdDialog.hide(answer);
		};

		
	};







}]);































myApp.controller("produitsAdminCtrl", ['$scope', 'Upload', 'ProduitsService', 'IngredientsService', '$mdDialog', function($scope, Upload, $ProduitsService, $IngredientsService, $mdDialog){
	$scope.produits = [];
	$scope.produitsAfficher = [];
	$scope.search = "";
	$scope.ingredients = [];
	$scope.categories = [];
	$scope.categorieEnCour = false;

	$scope.init = function(){
		
		$ProduitsService.getCategories().then(function(categories){
			$scope.categories = categories;
			if(categories.length>0){
				var cat = categories[0];
				$scope.categorieEnCour = cat;
				$scope.loadProduits();
			}
		}, function(error){
			toastr.error(error.message);
		});

	};


	$scope.loadProduits = function(){
		$ProduitsService.getByCategorie($scope.categorieEnCour).then(function(produits){

			console.log(produits);

			$IngredientsService.getAll().then(function(ingredients){
				$scope.ingredients = ingredients;
			}, function(err){
				toastr.error(err.message);
			});



			$scope.produits = produits;
			angular.copy($scope.produits, $scope.produitsAfficher);

			// met les ingredients en txt
			angular.forEach($scope.produits, function(prod){
				prod.ingredientTxt = prod.ingredients.map(function(ing){return ing.nom;}).join(", ");
			});

			
			
		}, function(err){
			toastr.error(error.message);
		})
	}


	$scope.delete = function(produit){
		$ProduitsService.del(produit).then(function(rep){
			if(rep.error)
				return toastr.error(rep.error.message);
			// recharge les produits
			$scope.loadProduits();
			toastr.info("Produit supprimé");

		}, function(error){
			toastr.error(error.message);
		});
	};

	$scope.modif = function(produit){
		$ProduitsService.modif(produit).then(function(rep){
			if(rep.error)
				return toastr.error(rep.error.message);

			toastr.info("Produit modifié");

			// recharge les produits
			$scope.loadProduits();

			
		}, function(error){
			toastr.error(error.message);
		});
	};

	$scope.onSearch = function(){
		$scope.produitsAfficher = $scope.produits.filter(function(produit){
			return produit.nom.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
		});
	};









	////// Dialog Ingrédients supp //////








	$scope.showDialog = function(ev, produit, type){
		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: '/admin/dialog/ajoutProduit',
	      parent: angular.element(document.body),
	      locals: {parentScope:$scope, Upload:Upload, ProduitsService:$ProduitsService, IngredientsService:$IngredientsService, 
	      	ingredients:$scope.ingredients, produit:produit, type:type},
	      targetEvent: ev,
	      clickOutsideToClose:true
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	};



	function DialogController($scope, $mdDialog, parentScope, Upload, ProduitsService, IngredientsService, ingredients, produit, type) {
		$scope.produit = {};
		$scope.ingredients = [];
		$scope.ingActive = {};
		$scope.type = type;
		$scope.parentScope = parentScope;

		$scope.choix = {'complet':true, 'simple':false};

		angular.copy(produit, $scope.produit);
		angular.copy(ingredients, $scope.ingredients);
		$scope.produit = produit === false ? {nom:"", tailles:[{nom:"", prix:0}], prix:0, photo:null, description:"", categorie:false, ingredients:[], base:null} : $scope.produit;

		if(!$scope.produit.categorie)
			$scope.produit.categorie = $scope.parentScope.categorieEnCour;

		if($scope.produit.tailles.length == 0)
			$scope.produit.tailles = [{nom:"", prix:0}];

		if(produit!==false)
			produit.ingredients.forEach(function(ing){
				$scope.ingActive[ing._id] = true;
			});

		$scope.changeChoix = function(choix){
			if(choix=="complet"){
				$scope.choix['complet']=true;
				$scope.choix['simple']=false;
			}else if(choix=="simple"){
				$scope.choix['complet']=false;
				$scope.choix['simple']=true;

			}else {
				toastr.error("mauvais choix");
			}
		};


		$scope.addTaille = function(){
			$scope.produit.tailles.push({nom:"", prix:0});
		}

		$scope.delTaille = function(index){
			$scope.produit.tailles.splice(index, 1);
		}

		$scope.upload = function (file) {
	        Upload.upload({
	            url: '/api/produits/upload',
	            data: {file: file, produit:$scope.produit}
	        }).then(function (resp) {
	        	$scope.produit.photo = "/images/"+resp.config.data.file.name;
	            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
	        }, function (resp) {
	            console.log('Error status: ' + resp.status);
	        }, function (evt) {
	            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
	            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
	        });
	    };



		$scope.modifIngredient = function(ingId){
			IngredientsService.get(ingId).then(function(ingredient){
				if($scope.ingActive[ingId] && $scope.ingActive[ingId] !== undefined){
					var idx = $scope.produit.ingredients.map(function(ing){return ing._id;}).indexOf(ingredient._id);
					if(idx !== -1)
						$scope.produit.ingredients.splice(idx, 1);
					else
						console.log("mauvais idx "+idx);
					$scope.ingActive[ingId] = false;
				}else{
					$scope.produit.ingredients.push(ingredient);
					$scope.ingActive[ingId] = true;
				}					
			});
		};



		$scope.modifBase = function(ingId){
			IngredientsService.get(ingId).then(function(ingredient){

				$scope.ingredients.forEach(function(ing){
					if(ing.base)
						$scope.ingActive[ing._id] = false;
				});


				if($scope.ingActive[ingId] && $scope.ingActive[ingId] !== undefined){
					$scope.produit.base = null;
					$scope.ingActive[ingId] = false;
				}else{
					$scope.produit.base = ingredient;
					$scope.ingActive[ingId] = true;
				}	
			});
		};




		$scope.valide = function(){
			if($scope.type=="ajouter"){
				ProduitsService.add($scope.produit).then(function(produit){
					$scope.parentScope.init();
					$scope.parentScope.loadProduits();
					$mdDialog.hide();
					toastr.success("Produit ajouté");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else if(type=="modifier"){
				ProduitsService.modif($scope.produit).then(function(produit){
					$scope.parentScope.init();
					$scope.parentScope.loadProduits();
					$mdDialog.hide();
					toastr.success("Produit modifié");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else{
				toastr.error("mauvais choix");
			}
		};


		$scope.hide = function() {
		  $mdDialog.hide();
		};

		$scope.cancel = function() {
		  $mdDialog.cancel();
		};

		$scope.answer = function(answer) {
		  $mdDialog.hide(answer);
		};

		
	};





}]);
























myApp.controller("ingredientsAdminCtrl", ['$scope', 'IngredientsService', '$mdDialog', function($scope, $IngredientsService, $mdDialog){
	$scope.ingredients = [];
	$scope.ingredientsAfficher = [];
	$scope.search = "";


	$scope.init = function(){
		$IngredientsService.getAll().then(function(ingredients){
			$scope.ingredients = ingredients;
			angular.copy($scope.ingredients, $scope.ingredientsAfficher);
		}, function(error){
			toastr.error(error.message);
		});
	};


	$scope.delete = function(ingredient){
		$IngredientsService.del(ingredient).then(function(rep){
			if(rep.error)
				return toastr.error(rep.error);

			$scope.init();
			toastr.info("Ingrédient supprimé");
			
		}, function(error){
			toastr.error(error.statusTxt);
		});
	};



	$scope.modif = function(ingredient){
		$IngredientsService.modif(ingredient).then(function(rep){
			if(rep.error)
				return toastr.error(rep.error.statusTxt);

			// recharge les produits
			$scope.init();
			toastr.info("Ingredient modifié");

			
		}, function(error){
			toastr.error(error.statusTxt);
		});
	};


	$scope.onSearch = function(){
		$scope.ingredientsAfficher = $scope.ingredients.filter(function(ingredient){
			return ingredient.nom.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
		});
	}










	////// Dialog Ingrédients supp //////








	$scope.showDialog = function(ev, ingredient, type){
		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: '/admin/dialog/ajoutIngredient',
	      parent: angular.element(document.body),
	      locals: {parentScope:$scope, IngredientsService:$IngredientsService, ingredient:ingredient, type:type},
	      targetEvent: ev,
	      clickOutsideToClose:true
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	};



	function DialogController($scope, $mdDialog, parentScope, IngredientsService, ingredient, type) {

		$scope.ingredient = {};
		$scope.type = type;
		$scope.parentScope = parentScope;

		angular.copy(ingredient, $scope.ingredient);
		$scope.ingredient = $scope.ingredient === false ? {nom:"", prix:0} : $scope.ingredient;
		


		$scope.valide = function(){
			if($scope.type=="ajouter"){
				IngredientsService.add($scope.ingredient).then(function(ingredient){
					$scope.parentScope.init();
					$mdDialog.hide();
					toastr.success("Ingrédient ajouté");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else if(type=="modifier"){
				IngredientsService.modif($scope.ingredient).then(function(ingredient){
					$scope.parentScope.init();
					$mdDialog.hide();
					toastr.success("Ingrédient modifié");
				}, function(err){
					toastr.error(err.statusTxt);
				});
			}else{
				toastr.error("mauvais choix");
			}
		};


		$scope.hide = function() {
		  $mdDialog.hide();
		};

		$scope.cancel = function() {
		  $mdDialog.cancel();
		};

		$scope.answer = function(answer) {
		  $mdDialog.hide(answer);
		};

		
	};



	

}]);


























myApp.controller("restaurantAdminCtrl", ['$scope', 'RestaurantService', '$mdDialog', 'Upload', function($scope, $RestaurantService, $mdDialo, Upload){
	
	$scope.place = null;
	$scope.onModif = false;

	$scope.autocompleteOptions = {
		componentRestrictions: { country: 'fr' },
		types: ['geocode']
	};


	$scope.restaurant = {
		enseigne:"",
		photo:"",
		adresse:{
			adresse:null,
			codePostal:null,
			ville:null,
			latitude:0,
			longitude:0,
			googleId:0
		},
		tempPreparation:0,
		livraison:{
			livraison:false,
			distance:0,
			duree:0,
			paiement:{
				livraison:false,
				surPlace:false,
				enLigne:false
			},
			tarif:0,
			minGratuit:0
		},
		admin:{
			username:"",
			password:null
		},
		horraires:[],
		fermetures: []
	};

	$scope.heureSemaine = [];
	for(var i=0;i<24;i++){
		$scope.heureSemaine.push(new Date(2017, 10, 20, i));
		$scope.heureSemaine.push(new Date(2017, 10, 20, i, 15));
		$scope.heureSemaine.push(new Date(2017, 10, 20, i, 30));
		$scope.heureSemaine.push(new Date(2017, 10, 20, i, 45));
	}

	$scope.joursSemaine = [
		new Date(2017, 10, 20),
		new Date(2017, 10, 21),
		new Date(2017, 10, 22),
		new Date(2017, 10, 23),
		new Date(2017, 10, 24),
		new Date(2017, 10, 25),
		new Date(2017, 10, 26)
	];

	$scope.init = function(){
		$RestaurantService.getMe().then(function(restaurant){
			$scope.restaurant._id = restaurant._id;
			$scope.restaurant.adresse = restaurant.adresse;
			$scope.restaurant.adresse.codePostal = parseInt(restaurant.adresse.codePostal);

			$scope.restaurant.enseigne = restaurant.enseigne;
			$scope.restaurant.livraison = restaurant.livraison;
			$scope.restaurant.photo = restaurant.photo;
			$scope.restaurant.email = restaurant.email;
			$scope.restaurant.telephone = restaurant.telephone;
			$scope.restaurant.tempPreparation = restaurant.tempPreparation;
			$scope.restaurant.horraires = restaurant.horraires.map(function(h){
				return {jour:new Date(h.jour), 
					matin:{ouverture:new Date(h.matin.ouverture), fermeture:new Date(h.matin.fermeture)},
					apresMidi:{ouverture:new Date(h.apresMidi.ouverture), fermeture:new Date(h.apresMidi.fermeture)}}
			});
			$scope.restaurant.fermetures = restaurant.fermetures.map(function(d){return new Date(d)});
			$scope.restaurant.admin.username = restaurant.admin.username;
			$scope.restaurant.distanceLivraison = parseFloat(restaurant.distanceLivraison);

			document.getElementById("adresse").value = restaurant.adresse.adresse;

		}, function(err){
			$scope.onModif=false;
			toastr.error(err);
		});
	};




	$scope.upload = function (file) {
        Upload.upload({
            url: '/api/restaurant/upload',
            data: {file: file, restaurant:$scope.restaurant}
        }).then(function (resp) {
        	$scope.restaurant.photo = "/images/"+resp.config.data.file.name;
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
    };






	$scope.addHorraire = function(){
		$scope.restaurant.horraires.push({
			jour:new Date(2017, 10, 20),
			matin:{
				ouverture:new Date(2017, 10, 20, 11),
				fermeture:new Date(2017, 10, 20, 13, 30)
			},
			apresMidi:{
				ouverture:new Date(2017, 10, 20, 18),
				fermeture:new Date(2017, 10, 20, 21, 30)
			}
		});
		$scope.modif();
	};


	$scope.delHorraire = function(horraire){
		var idx = $scope.restaurant.horraires.indexOf(horraire);
		if(idx != -1)
			$scope.restaurant.horraires.splice(idx, 1);
		else
			console.log("mauvais idx "+idx);
		$scope.modif();
	};



	$scope.addFermeture = function(){
		$scope.restaurant.fermetures.push(new Date());
		$scope.modif();
	}


	$scope.delFermeture = function(fermeture){
		var idx = $scope.restaurant.fermetures.indexOf(fermeture);
		if(idx != -1)
			$scope.restaurant.fermetures.splice(idx, 1);
		else
			console.log("mauvais idx "+idx);
		$scope.modif();
	};


	$scope.modif = function(){
		$scope.onModif=true;
		$RestaurantService.modif($scope.restaurant).then(function(restaurant){
			$scope.onModif=false;
			$scope.restaurant = restaurant;
			$scope.restaurant.horraires = restaurant.horraires.map(function(h){
				return {jour:new Date(h.jour), 
					matin:{ouverture:new Date(h.matin.ouverture), fermeture:new Date(h.matin.fermeture)},
					apresMidi:{ouverture:new Date(h.apresMidi.ouverture), fermeture:new Date(h.apresMidi.fermeture)}}
			});
			$scope.restaurant.fermetures = restaurant.fermetures.map(function(d){return new Date(d)});
			toastr.info("Restaurant modifié");
		}, function(err){
			toastr.error(err);
		})
	};


	$scope.loadPlace = function(){

	    for (var i = 0; i < $scope.place.address_components.length; i++) {
	    	var addressType = $scope.place.address_components[i].types[0];
	    	if(addressType=="postal_code")
	    		$scope.restaurant.adresse.codePostal = parseInt($scope.place.address_components[i]['long_name']);
	    };

	    $scope.restaurant.adresse.adresse = $scope.place.name;
	    $scope.restaurant.adresse.ville = $scope.place.vicinity;
	    $scope.restaurant.adresse.googleId = $scope.place.place_id;
	    $scope.restaurant.adresse.latitude = $scope.place.geometry.location.lat();
	    $scope.restaurant.adresse.longitude = $scope.place.geometry.location.lng();
	}


	

}]);




































myApp.controller("clientsAdminCtrl", ['$scope', 'ClientsService', '$mdDialog', function($scope, $ClientsService, $mdDialog){
	$scope.clients = [];
	$scope.clientsAfficher = [];

	$scope.export = {
		filename:"clients",
		values:[],
		header:['Nom','Prenom','Email','Téléphone','Adresse','Ville','Code postal'],
		separator:";"

	}

	$scope.init = function(){
		$ClientsService.getAll().then(function(clients){
			$scope.clients = clients;
			angular.copy($scope.clients, $scope.clientsAfficher);
			$scope.export.values = clients.map(function(client){
				return {nom:client.nom, prenom:client.prenom, email:client.email, telephone:client.telephone, 
					adresse:client.adresse.adresse, ville:client.adresse.ville, codePostal:client.adresse.codePostal};
			});
		}, function(error){
			toastr.error(error.message);
		});
	};


	$scope.delete = function(client){
		$ClientService.del(client).then(function(rep){
			if(rep.error) return toastr.error(rep.error);
			return $scope.init();
		}, function(err){
			toastr.error(err);
		});
	};


	$scope.modif = function(client){
		$ClientService.modif(client).then(function(rep){
			if(rep.error) return toastr.error(rep.error);
			return $scope.init();
		}, function(err){
			toastr.error(err);
		});
	};


	$scope.onSearch = function(){
		$scope.clientsAfficher = $scope.clients.filter(function(client){
			return client.nom.toLowerCase().indexOf($scope.search.toLowerCase()) !== -1;
		});
	}
	

}]);

