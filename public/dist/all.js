'use strict';



const myApp = angular.module("restaurant", ['ngAnimate','ngResource', 'ngRoute', 'ngDialog', 'ngMaterial', 'ngCookies', 
	'ngFileUpload', 'ngSanitize', 'ngCsv', 'ngGeolocation', 'angular.google.distance', 'google.places','mgcrea.bootstrap.affix',
	'restaurant.services', 'categorie.services', 'clients.services', 'panier.services', 
	'configuration.services', 'ingredients.services', 'produits.services']);


myApp.config(['$httpProvider', function($httpProvider) {
	$httpProvider.defaults.headers.common["X-Requested-With"] =  'XMLHttpRequest';
	$httpProvider.defaults.headers.common["Content-Type"] =  'application/json';

	if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }  

	$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
	$httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';


}]);





myApp.run(function($rootScope, $templateCache, $location, PanierService, anchorSmoothScroll) {

	$rootScope.commandes =  [];
	$rootScope.panier =  {};
	$rootScope.client =  {};
	$rootScope.restaurant =  {};
	$rootScope.loading =  false;
	$rootScope.total =  0;



	$rootScope.$on("$locationChangeStart", function(event, next, current) {
		$rootScope.loading = true;
	});



	$rootScope.go = function (path) {
		$.slidebars.close();
		$location.path(path);
	};

	$rootScope.gotoAnchor = function(hash) {
		if($location.path() != "/")
			$location.path("/");
		else
			anchorSmoothScroll.scrollTo(hash);
		return false;
	};

	$rootScope.delCommande = function(commande){
		PanierService.delCommande(commande).then(function(panier){
			$rootScope.panier = panier;
			$rootScope.commandes = panier.commandes;
			$rootScope.total = panier.total;
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		})
	};


	$rootScope.loadPanier = function(){
		PanierService.get().then(function(data){
			if(data.panier){
				$rootScope.panier = data.panier;
			 	$rootScope.commandes = data.panier.commandes;
			 	$rootScope.total = data.panier.total;
			}
		 	if(data.client)
			 	$rootScope.client = data.client;
			if(data.restaurant)
			 	$rootScope.restaurant = data.restaurant;
		 }, function(err){
		 	console.log(err);
		 	toastr.error(err.statusText);
		 });
	};


	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
		$rootScope.loading = false;
	});

	// $rootScope.$on('$routeChangeStart', function(event, next, current) {

	// });
});


myApp.config(['$mdAriaProvider', function($mdAriaProvider) {
   // Globally disables all ARIA warnings.
   $mdAriaProvider.disableWarnings();
}]);


// myApp.run(['$anchorScroll', function($anchorScroll) {
//   $anchorScroll.yOffset = 50;   // always scroll by 50 extra pixels
// }]);

// myApp.filter('unsafe', function($sce) { return $sce.trustAsHtml; });



// myApp.config(function(uiGmapGoogleMapApiProvider) {
//     uiGmapGoogleMapApiProvider.configure({
//         key: 'AIzaSyDErLpJaVJgJA_L5QHKSPghgTsLHZp4WzE',
//         v: '3.20', //defaults to latest 3.X anyhow
//         libraries: 'places,weather,geometry,visualization'
//     });
// });




myApp.config(function($routeProvider, $locationProvider) {
	$routeProvider
		.when("/", {
			templateUrl:"/accueil",
			controller:"accueilCtrl",
			cache: true
		})
		.when("/panier", {
			templateUrl:"/panier",
			controller:"panierCtrl",
			cache: true
		})
		.when("/choixPaiement", {
			templateUrl:"/choixPaiement",
			controller:"paiementCtrl",
			cache:true
		})
		.when("/livraison", {
			templateUrl:"/livraison",
			controller:"livraisonCtrl",
			cache: false
		})
		.when("/paiement", {
			templateUrl:"/paiement",
			controller:"paiementCtrl",
			cache: false
		})
		.when("/validation", {
			templateUrl:"/validation",
			controller:"validationCtrl",
			cache: false
		})
		.otherwise({
			redirectTo: "/"
		});


	$routeProvider
		.when("/admin", {
			templateUrl:"/admin",
			controller:"accueilAdminCtrl",
			cache: false
		})
		.when("/admin/index", {
			templateUrl:"/admin/categorie",
			controller:"categorieAdminCtrl",
			cache: false
		})
		.when("/admin/categorie", {
			templateUrl:"/admin/categorie",
			controller:"categorieAdminCtrl",
			cache: false
		})
		.when("/admin/produits", {
			templateUrl:"/admin/produits",
			controller:"produitsAdminCtrl",
			cache: false
		})
		.when("/admin/ingredients", {
			templateUrl:"/admin/ingredients",
			controller:"ingredientsAdminCtrl",
			cache: false
		})
		.when("/admin/configuration", {
			templateUrl:"/admin/configuration",
			controller:"restaurantAdminCtrl",
			cache: false
		})
		.when("/admin/clients", {
			templateUrl:"/admin/clients",
			controller:"clientsAdminCtrl",
			cache: false
		});


	$locationProvider
		.html5Mode(true)
		.hashPrefix('!');

});



// myApp.config(['$stateProvider','$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
// 	$stateProvider
// 		.state("accueil", {
// 			templateUrl:"/accueil",
// 			controller:"accueilCtrl"
// 		})
// 		.state("panier", {
// 			templateUrl:"/panier",
// 			controller:"panierCtrl"
// 		})
// 		.state("/choixPaiement", {
// 			templateUrl:"/choixPaiement",
// 			controller:"paiementCtrl"
// 		})
// 		.state("/livraison", {
// 			templateUrl:"/livraison",
// 			controller:"paiementCtrl"
// 		})
// 		.state("/paiement", {
// 			templateUrl:"/paiement",
// 			controller:"paiementCtrl"
// 		})
// 		.state("/terminer", {
// 			templateUrl:"/terminer",
// 			controller:"terminerCtrl"
// 		})
// 		.otherwise({
// 			templateUrl:"/accueil",
// 			controller:"accueilCtrl"
// 		});

// }]);
'use strict';

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


'use strict';


myApp.controller('MainCtrl', ['$scope', '$rootScope', 'anchorSmoothScroll', function($scope, $rootScope, anchorSmoothScroll){

	$rootScope.loading = true;

	$scope.gotoAnchor = function(hash) {
		anchorSmoothScroll.scrollTo(hash);
		return false;
	};

}]);

myApp.controller("accueilCtrl", ['$scope', '$rootScope', '$timeout', 'anchorSmoothScroll', '$sce', '$mdDialog', '$location', '$cookieStore', 'ProduitsService', 'PanierService', 'IngredientsService', 'ClientsService',
	function($scope, $rootScope, $timeout, anchorSmoothScroll, $sce, $mdDialog, $location, $cookieStore, $ProduitsService, $PanierService, $IngredientsService, $ClientsService){

	$scope.isInit = true;
	$scope.categorie = null;
	$scope.catId = null;
	$scope.infosProds = {};
	$scope.produits = [];
	$scope.client = {};
	$scope.restaurant = {};
	$scope.ingredients = {};
	$scope.commandes = [];
	$scope.total = parseFloat(0);

	$scope.produitOpen = {};
	$scope.produitZindex = {};
	$scope.backProduit = 3;
	$scope.onLoadProduits = false;

	$scope.closeCommandes = function(){
		$scope.backProduit = 3;
		for(var k in $scope.produitOpen){
			$scope.produitOpen[k] = false;
			$scope.produitZindex[k] = 5;
		}
	};

	$scope.changeProduit = function(pid){
		$scope.closeCommandes();
		$scope.produitOpen[pid] = true;
		$scope.backProduit = 6;
		$scope.produitZindex[pid] = 7;

	}

	$scope.getTotal = function(){
		$scope.total = Math.round($scope.total*100)/100;
		var n = Math.floor($scope.total);
		var d = (''+($scope.total - n).toFixed(2)).split(".");
		if(d.length>1)
			return $sce.trustAsHtml(n+".<span class='cents'>"+d[1]+"</span>&nbsp;&euro;");
		else
			return $sce.trustAsHtml(n+".<span class='cents'>00</span>&nbsp;&euro;");
	}


	$scope.init = function(catId){

		console.log("init Accueil");

		$scope.catId = catId;

		$ClientsService.getMe().then(function(data){
			$cookieStore.put('client', data.client);
			$cookieStore.put('panier', data.panier);
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});
		$scope.loadIngredients();
		$scope.loadProduits();

		 
		 // console.log(angular.element('selectpicker'));

		 // initJquery(jQuery);
	};


	$scope.loadPanier = function(){
		$PanierService.get().then(function(data){
			if(data.panier){
				$scope.commandes = data.panier.commandes;
			 	$scope.client = data.panier.client;
			 	$scope.restaurant = data.panier.restaurant;
			 	$scope.total = data.panier.total;

			 	angular.copy($scope.commandes, $rootScope.commandes);
			 	angular.copy(data.panier, $rootScope.panier);

			}
		 }, function(err){
		 	console.log(err);
		 	toastr.error(err.statusText);
		 });
	};


	$scope.loadProduits = function(loader){
		var loader = loader === undefined ? true : loader;
		if(loader) 
			$scope.onLoadProduits = true;
		$ProduitsService.getByCategorie({_id:$scope.catId}).then(function(produits){
			produits = produits.filter(function(prod){return prod.stock;});
			$scope.produits = new Array();
			produits.forEach(function(prod){
				$scope.infosProds[prod._id] = {taille:false, tailles:prod.tailles, prix:prod.prix, total:prod.prix, quantite:1, ingredients:{base:prod.base, more:[], less:[]}};
				if(prod.tailles.length > 0)
					$scope.infosProds[prod._id].taille = prod.tailles[0];
				$scope.categorie = prod.categorie;
				$scope.catId = prod.categorie._id;
				$scope.produits.push(prod);
				// $('.selectpicker').selectpicker({size:5});
			});

			$timeout(function(){
				$scope.onLoadProduits = false;
			}, 600);

		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});
	};


	$scope.loadIngredients = function(){
		$IngredientsService.getAll().then(function(ingredients){
			
			ingredients.forEach(function(ing){
				$scope.ingredients[ing._id.toString()] = ing;
			});

		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});
	}


	$scope.addQuantite = function(prodId){
		$scope.infosProds[prodId].quantite = $scope.infosProds[prodId].quantite+1;
		$scope.calculTotalProd(prodId);
		return false;
	};

	$scope.delQuantite = function(prodId){
		$scope.infosProds[prodId].quantite = $scope.infosProds[prodId].quantite-1;
		if($scope.infosProds[prodId].quantite<1)
			$scope.infosProds[prodId].quantite = 1;
		$scope.calculTotalProd(prodId);
		return false;
	};


	$scope.calculTotalProd = function(prodId){
		var tot = 0;
		console.log(prodId);
		if($scope.infosProds[prodId].ingredients.more.length){
			tot += $scope.infosProds[prodId].ingredients.more.map(function(ing){return ing.prix;}).reduce(function(a,b){return a+b;})
		}

		// if($scope.infosProds[prodId].ingredients.less.length){
		// 	tot -= $scope.infosProds[prodId].ingredients.less.map(function(ing){return ing.prix;}).reduce(function(a,b){return a+b;})
		// }

		// console.log($scope.infosProds[prodId]);
		
		tot += $scope.infosProds[prodId].prix;
		if($scope.infosProds[$scope.prodId].taille)
			tot += $scope.infosProds[$scope.prodId].taille.prix;
		tot *= $scope.infosProds[prodId].quantite;
		$scope.infosProds[prodId].total = Math.round(tot*100)/100;
		return false;
	}


	$scope.changeCategorie = function(catId){
		$scope.catId = catId;
		$scope.closeCommandes();
		$scope.loadProduits();
	};


	$scope.ajout = function(prodId){
		$ProduitsService.get(prodId).then(function(produit){

			// creer commande

			$PanierService.addCommande(produit, $scope.infosProds[produit._id]).then(function(commande){
				$scope.commandes.push(commande);
				$scope.infosProds[produit._id] = {taille:false, base:produit.base, prix:produit.prix, total:produit.prix, quantite:1, ingredients:{more:[], less:[]}};
				if(produit.tailles.length > 0)
					$scope.infosProds[produit._id].taille = produit.tailles[0];
				$scope.loadPanier();
				toastr.success("Ajouter au panier");
				$scope.loadProduits(false);
				$scope.loadIngredients();
				// initJquery(jQuery);
			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			})

			
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});
	};













	////// Dialog Ingredients supp //////






	$scope.showDialog = function(ev, prodId){
		$scope.prodId = prodId;
		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: '/dialogIngredient?prodId='+prodId,
	      parent: angular.element(document.body),
	      locals: {IngredientsService: $IngredientsService, ingredients:$scope.ingredients,
	      	prodId:prodId, infosProds:$scope.infosProds, total:$scope.infosProds[prodId].total, parentScope:$scope, 
	      	ProduitsService:$ProduitsService, PanierService:$PanierService, ClientsService:$ClientsService, cookieStore:$cookieStore },
	      targetEvent: ev,
	      clickOutsideToClose:true
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	};



	function DialogController($scope, $mdDialog, IngredientsService, ingredients, prodId, infosProds, total, 
		parentScope, ProduitsService, PanierService, ClientsService, cookieStore) {

		// collapse
		$(".btn-collapse").click();
		$scope.ingredients = {};
		$scope.infosProds = {};
		angular.copy(ingredients, $scope.ingredients);
		angular.copy(infosProds, $scope.infosProds);
		$scope.total = total;
		$scope.prodId = prodId;
		$scope.produit = $scope.infosProds[prodId];
		$scope.parentScope = parentScope;

		$scope.ingActive = [];
		Object.keys($scope.ingredients).forEach(function(k){$scope.ingActive[k] = false;}) // Bonne idée !
		infosProds[$scope.prodId].ingredients.more.forEach(function(ing){
			$scope.ingActive[ing._id.toString()] = true;
			$scope.total += ing.prix;
		});


		$scope.tailleActive = [];
		if($scope.produit.tailles.length>0){
			$scope.produit.tailles.forEach(function(taille){
				if($scope.produit.taille == taille)
					$scope.tailleActive[taille._id] = true;
				else
					$scope.tailleActive[taille._id] = false;
			});
		}

		// console.log(infosProds[$scope.prodId].ingredients)

		if(infosProds[$scope.prodId].ingredients.base)
			$scope.ingActive[infosProds[$scope.prodId].ingredients.base._id.toString()] = true;






		$scope.addIngredient = function(ingId){
			var ingredient = $scope.ingredients[ingId];
			var prodId = $scope.prodId;
			if(!$scope.ingActive[ingId]){
				$scope.infosProds[$scope.prodId].ingredients.more.push(ingredient);
				$scope.ingActive[ingId] = true;
				$scope.total += $scope.ingredients[ingId].prix;
			}else{
				$scope.ingActive[ingId] = false;
				$scope.total -= $scope.ingredients[ingId].prix;
				var idx = $scope.infosProds[$scope.prodId].ingredients.more.indexOf(ingredient);
				if(idx !== -1)
					$scope.infosProds[$scope.prodId].ingredients.more.splice(idx, 1);
			}

			parentScope.calculTotalProd($scope.prodId);
			
			return false;
		};


		$scope.delIngredient = function(ingId){
			var ingredient = $scope.ingredients[ingId];
			var prodId = $scope.prodId;
			if(!$scope.ingActive[ingId]){
				$scope.infosProds[$scope.prodId].ingredients.less.push(ingredient);
				$scope.ingActive[ingId] = true;
			}else{
				$scope.ingActive[ingId] = false;
				var idx = $scope.infosProds[$scope.prodId].ingredients.less.indexOf(ingredient);
				if(idx !== -1)
					$scope.infosProds[$scope.prodId].ingredients.less.splice(idx, 1);
			}

			parentScope.calculTotalProd($scope.prodId);
			
			return false;
		};


		$scope.changeBase = function(ingId){
			Object.keys($scope.ingredients).forEach(function(k){
				if($scope.ingredients[k].base)
					$scope.ingActive[k] = false;
			});

			var ingredient = $scope.ingredients[ingId];
			var prodId = $scope.prodId;
			if(!$scope.ingActive[ingId]){
				$scope.infosProds[$scope.prodId].ingredients.base = ingredient;
				$scope.ingActive[ingId] = true;
			}else{
				$scope.ingActive[ingId] = false;
				$scope.infosProds[$scope.prodId].ingredients.base = false;
			}
		}



		$scope.changeTaille = function(tailleId){
			if($scope.produit.tailles.length <= 1){
				$scope.tailleActive[tailleId] = true;
				return;
			}

			$scope.produit.tailles.forEach(function(taille){
				if(taille._id == tailleId){
					if($scope.tailleActive[taille._id]){
						$scope.total -= taille.prix;
						$scope.tailleActive[taille._id] = false;
					}else{
						$scope.total += taille.prix;
						$scope.tailleActive[taille._id] = true;
					}
				}else{
					if($scope.tailleActive[taille._id])
						$scope.total -= taille.prix;
					$scope.tailleActive[taille._id] = false;
				}

			});
			var taille = $scope.produit.tailles.filter(function(t){return t._id==tailleId;})[0];
			$scope.produit.taille = taille;
			return;
		}



		$scope.getTotal = function(){
			$scope.total = Math.round($scope.total*100)/100;
			var n = Math.floor($scope.total);
			var d = (''+($scope.total - n).toFixed(2)).split(".");
			if(d.length>1)
				return $sce.trustAsHtml(n+".<span class='cents'>"+d[1]+"</span>&nbsp;&euro;");
			else
				return $sce.trustAsHtml(n+".<span class='cents'>00</span>&nbsp;&euro;");
		};


		$scope.valide = function(){
			var prodId = $scope.prodId;
			$scope.infosProds[prodId] = $scope.produit;
			parentScope.infosProds = $scope.infosProds;
			parentScope.ajout(prodId);
			// parentScope.calculTotalProd(prodId);
			// parentScope.loadPanier();
			$mdDialog.hide();
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















///////////////////: Panier ////////////////////











myApp.controller("panierCtrl", ['$scope', '$rootScope', '$location', '$route', '$cookieStore', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $route, $cookieStore, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){
		$scope.infosCmds = {};
		$scope.panier = null;
		$scope.commandes = [];
		$scope.client = null;
		$scope.restaurant = null;
		$scope.livraison = null;

		$scope.go = function (path) {$location.path(path);};

		$scope.setLivraison = function(livraison){
			$cookieStore.put('livraison', livraison);
			$scope.livraison = livraison;

			if(livraison=="chezSoi"){
				$scope.client.livraison.surPlace = false;
				$scope.client.livraison.domicile = true;
			}else if(livraison=="surPlace"){
				$scope.client.livraison.surPlace = true;
				$scope.client.livraison.domicile = false;
			}else{
				console.log("Pas de choix de livraison");
				// toastr.error("502 : Mauvais choix");
			}

			$ClientsService.modif($scope.client._id, $scope.client).then(function(client){
				$scope.client = client;
			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			});
		};






		$scope.init = function(){
			console.log("init Panier");
			$PanierService.get().then(function(data){
				$scope.panier = data.panier;
				$scope.client = data.client;
				$scope.restaurant = data.restaurant;
				$scope.commandes = data.panier.commandes;
				$scope.commandes.forEach(function(cmd){
					$scope.infosCmds[cmd._id] = {quantite:cmd.quantite, total:cmd.total, 
							ingredients:{base:[], more:cmd.ingredients.more, less:cmd.ingredients.less}};
					if(cmd.taille !== null)
						$scope.infosCmds[cmd._id]['taille'] = cmd.taille._id;
					
					if($scope.client.livraison.domicile)
						$scope.livraison = "chezSoi";
					else if($scope.client.livraison.surPlace)
						$scope.livraison = "surPlace";
					else
						$scope.livraison = "surPlace";
				});


				if($cookieStore.get("livraison"))
					$scope.setLivraison($cookieStore.get("livraison"));
				else
					$scope.setLivraison('enLigne');

				angular.copy($scope.commandes, $rootScope.commandes);
			 	angular.copy($scope.panier, $rootScope.panier);

			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			});
		};



		$scope.addQuantite = function(cmdId){
			$scope.infosCmds[cmdId].quantite = $scope.infosCmds[cmdId].quantite+1;
			$PanierService.modifCommande({_id:cmdId}, $scope.infosCmds[cmdId]).then(function(commande){
				$scope.infosCmds[cmdId].total = commande.total;
				$scope.init();

			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			});
		};

		$scope.delQuantite = function(cmdId){
			$scope.infosCmds[cmdId].quantite = $scope.infosCmds[cmdId].quantite-1;
			if($scope.infosCmds[cmdId].quantite<1)
				$scope.infosCmds[cmdId].quantite = 1;

			$PanierService.modifCommande({_id:cmdId}, $scope.infosCmds[cmdId]).then(function(commande){
				$scope.infosCmds[cmdId].total = commande.total;
				$scope.init();

			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			});

		};


		$scope.delCommande = function(cmdId){
			$PanierService.delCommande({_id:cmdId}).then(function(panier){
				$scope.panier = panier;
				angular.copy(panier.commandes, $rootScope.commandes);
			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			})
		};



		$scope.modifCommande = function(cmdId){
			$PanierService.modifCommande({_id:cmdId}).then(function(commande){
				$route.reload();
			}, function(err){
				console.log(err);
				toastr.error(err.statusText);
			})
		};

		$scope.init();





	////// Dialog Ingredients supp //////






	$scope.showDialog = function(ev, cmdId){
		$scope.prodId = prodId;
		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: '/dialogIngredient?prodId='+prodId,
	      parent: angular.element(document.body),
	      locals: { IngredientsService: $IngredientsService, commandes:$scope.commandes,
	      	prodId:prodId, infosCmds:$scope.infosCmds, total:$scope.infosCmds[cmdId].total, parentScope:$scope, 
	      	PanierService:$PanierService, ClientsService:$ClientsService, cookieStore:$cookieStore },
	      targetEvent: ev,
	      clickOutsideToClose:true
	    })
	    .then(function(answer) {
	      $scope.status = 'You said the information was "' + answer + '".';
	    }, function() {
	      $scope.status = 'You cancelled the dialog.';
	    });
	};



	function DialogController($scope, $mdDialog, IngredientsService, commandes, prodId, infosCmds, total, 
		parentScope, PanierService, ClientsService, cookieStore) {

		$scope.commandes = commandes;
		$scope.total = total;
		$scope.infosProds = infosProds;
		$scope.prodId = prodId;
		$scope.parentScope = parentScope;

		$scope.ingActive = [];
		Object.keys(ingredients).forEach(function(k){$scope.ingActive[k] = false;}) // Bonne idée !
		infosProds[$scope.prodId].ingredients.more.forEach(function(ing){
			$scope.ingActive[ing._id.toString()] = true;
			$scope.total += ing.prix;
		});


		$scope.addIngredient = function(ingId){
			var ingredient = $scope.ingredients[ingId];
			var prodId = $scope.prodId;
			if(!$scope.ingActive[ingId]){
				$scope.infosProds[$scope.prodId].ingredients.more.push(ingredient);
				$scope.ingActive[ingId] = true;
				$scope.total += $scope.ingredients[ingId].prix;
			}else{
				$scope.ingActive[ingId] = false;
				$scope.total -= $scope.ingredients[ingId].prix;
				var idx = $scope.infosProds[$scope.prodId].ingredients.more.indexOf(ingredient);
				if(idx !== -1)
					$scope.infosProds[$scope.prodId].ingredients.more.splice(idx, 1);
			}


			parentScope.calculTotalProd($scope.prodId);
			
			return false;
		};


		$scope.delIngredient = function(ingId){
			var ingredient = $scope.ingredients[ingId];
			var prodId = $scope.prodId;
			if(!$scope.ingActive[ingId]){
				$scope.infosProds[$scope.prodId].ingredients.less.push(ingredient);
				$scope.ingActive[ingId] = true;
			}else{
				$scope.ingActive[ingId] = false;
				$scope.total -= $scope.ingredients[ingId].prix;
				var idx = $scope.infosProds[$scope.prodId].ingredients.less.indexOf(ingredient);
				if(idx !== -1)
					$scope.infosProds[$scope.prodId].ingredients.less.splice(idx, 1);
			}

			parentScope.calculTotalProd($scope.prodId);
			
			return false;
		};

		$scope.getTotal = function(){
			$scope.total = Math.round($scope.total*100)/100;
			var n = Math.floor($scope.total);
			var d = (''+($scope.total - n).toFixed(2)).split(".");
			if(d.length>1)
				return $sce.trustAsHtml(n+".<span class='cents'>"+d[1]+"</span>&nbsp;&euro;");
			else
				return $sce.trustAsHtml(n+".<span class='cents'>00</span>&nbsp;&euro;");
		};


		$scope.valide = function(){
			var prodId = $scope.prodId;
			$scope.infosProds[prodId];
			parentScope.infosProds = $scope.infosProds;
			parentScope.calculTotalProd(prodId);
			parentScope.loadPanier();
			$mdDialog.hide();
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










/////////////////////// Livraison ////////////////////////////









myApp.controller("livraisonCtrl", ['$scope', '$rootScope', '$location', '$route', '$cookieStore', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $route, $cookieStore, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


	$scope.commandes = [];
	$scope.place = null;
	$scope.panier = null;
	$scope.client = null;
	$scope.restaurant = null;
	$scope.loading = false;
	$scope.choixPaiement = false;
	$scope.autocompleteOptions = {
		componentRestrictions: { country: 'fr' },
		types: ['geocode']
	};


	$scope.go = function (path) {$location.path(path);};

	$scope.init = function(){

		console.log("init Paiement");

		$PanierService.get().then(function(data){
			$scope.loading = false;
			$scope.panier = data.panier;
			$scope.client = data.client;
			$scope.client.typePaiement = "cash";
			$scope.client.distance = 0;
			$scope.client.adresse = {adresse:"", ville:"", googleId:false, latitude:0, longitude:0};
			$scope.restaurant = data.restaurant;
			$scope.commandes = data.panier.commandes;
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});

		if($cookieStore.get("choixPaiement"))
			$scope.choixPaiement = $cookieStore.get("choixPaiement");
		if($cookieStore.get("livraison"))
			$scope.livraison = $cookieStore.get("livraison");
	};


	$scope.valide = function(){
		$rootScope.loading = true;
		$ClientsService.modif($scope.client._id, $scope.client).then(function(client){
			$scope.client = client;
			$PanierService.sendMail($scope.client, $scope.panier).then(function(mail){
				$location.path("/validation");
				return true;
			}, function(err){
				console.log(err);
				toastr.error(err.statusTxt);
				return false;
			})
		}, function(err){
			console.log(err);
			toastr.error(err.statusTxt);
			return false;
		});
	}


	$scope.loadPlace = function(){
		console.log($scope.place);
	    for (var i = 0; i < $scope.place.address_components.length; i++) {
	    	var addressType = $scope.place.address_components[i].types[0];
	    	if(addressType=="postal_code")
	    		$scope.client.adresse.codePostal = parseInt($scope.place.address_components[i]['long_name']);
	    };

	    $scope.client.adresse.adresse = $scope.place.name;
	    $scope.client.adresse.ville = $scope.place.vicinity;
	    $scope.client.adresse.googleId = $scope.place.place_id;
	    $scope.client.adresse.latitude = $scope.place.geometry.location.lat();
	    $scope.client.adresse.longitude = $scope.place.geometry.location.lng();

		var dep = new Parse.GeoPoint([$scope.place.geometry.location.lat(), $scope.place.geometry.location.lng()]);
		var arr = new Parse.GeoPoint([$scope.restaurant.adresse.latitude, $scope.restaurant.adresse.longitude]);
		$scope.client.distance = Math.round(dep.kilometersTo(arr)*100)/100;

	};


	$scope.init();

	$scope.getLivraison = function(){
		if($scope.restaurant== null) return 0;
		if($scope.restaurant.livraison.minGratuit < $scope.panier.total)
			return 0;
		else
			return $scope.restaurant.livraison.tarif;
	}

	$scope.getTotal= function(){
		if($scope.restaurant== null) return 0;
		if($scope.restaurant.livraison.minGratuit < $scope.panier.total)
			return $scope.panier.total;
		else
			return $scope.panier.total + $scope.restaurant.livraison.tarif;
	}




}]);













/////////////////////// Paiement ////////////////////////////








myApp.controller("paiementCtrl", ['$scope', '$rootScope', '$location', '$cookieStore', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $cookieStore, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


	$scope.commandes = [];
	$scope.panier = null;
	$scope.client = null;
	$scope.restaurant = null;
	$scope.choixPaiement = false;

	$scope.go = function (path) {$location.path(path);};

	$scope.init = function(){

		console.log("init Paiement");

		$PanierService.get().then(function(data){
			$scope.loading = false;
			$scope.panier = data.panier;
			$scope.client = data.client;
			$scope.restaurant = data.restaurant;
			$scope.commandes = data.panier.commandes;
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});

		if($cookieStore.get("choixPaiement"))
			$scope.choixPaiement = $cookieStore.get("choixPaiement");
	};


	$scope.validLivraison = function(){
		$ClientsService.modif($scope.client._id, $scope.client).then(function(client){
			$scope.client = client;
			$location.path("/validation");
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});
	}




	$scope.setChoixPaiement = function(choix){
		$cookieStore.put('choixPaiement', choix);
		$scope.choixPaiement = choix;
		console.log($scope.client);

		if(choix=="enLigne"){
			$scope.client.paiement.enLigne == true;
			$scope.client.paiement.surPlace == false;
			$scope.client.paiement.livraison == false;
		}else if(choix=="surPlace"){
			$scope.client.paiement.enLigne == false;
			$scope.client.paiement.surPlace == true;
			$scope.client.paiement.livraison == false;
		}else if(choix=="livraison"){
			$scope.client.paiement.enLigne == false;
			$scope.client.paiement.surPlace == false;
			$scope.client.paiement.livraison == true;
		}

		$ClientsService.modif($scope.client._id, $scope.client).then(function(client){
			$scope.client = client;
		}, function(err){
			console.log(err);
			toastr.error(err.statusText);
		});

		$location.path("/livraison");
	};

}]);










/////////////////////// Validation ////////////////////////////







myApp.controller("validationCtrl", ['$scope', '$rootScope', '$location', '$cookieStore', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $cookieStore, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


	$scope.commandes = [];
	$scope.panier = null;
	$scope.client = null;
	$scope.restaurant = null;
	$scope.choixPaiement = false;


}]);



/*
 * angular-google-places-autocomplete
 *
 * Copyright (c) 2014 "kuhnza" David Kuhn
 * Licensed under the MIT license.
 * https://github.com/kuhnza/angular-google-places-autocomplete/blob/master/LICENSE
 */

 'use strict';

angular.module('google.places', [])
  /**
   * DI wrapper around global google places library.
   *
   * Note: requires the Google Places API to already be loaded on the page.
   */
  .factory('googlePlacesApi', ['$window', function ($window) {
        if (!$window.google) throw 'Global `google` var missing. Did you forget to include the places API script?';

    return $window.google;
  }])

  /**
   * Autocomplete directive. Use like this:
   *
   * <input type="text" g-places-autocomplete ng-model="myScopeVar" />
   */
  .directive('gPlacesAutocomplete',
        [ '$parse', '$compile', '$timeout', '$document', 'googlePlacesApi',
        function ($parse, $compile, $timeout, $document, google) {

            return {
                restrict: 'A',
                require: '^ngModel',
                scope: {
                    model: '=ngModel',
                    options: '=?',
                    forceSelection: '=?',
                    customPlaces: '=?'
                },
                controller: ['$scope', function ($scope) {}],
                link: function ($scope, element, attrs, controller) {
                    var keymap = {
                            tab: 9,
                            enter: 13,
                            esc: 27,
                            up: 38,
                            down: 40
                        },
                        hotkeys = [keymap.tab, keymap.enter, keymap.esc, keymap.up, keymap.down],
                        autocompleteService = new google.maps.places.AutocompleteService(),
                        placesService = new google.maps.places.PlacesService(element[0]);

                    (function init() {
                        $scope.query = '';
                        $scope.predictions = [];
                        $scope.input = element;
                        $scope.options = $scope.options || {};

                        initAutocompleteDrawer();
                        initEvents();
                        initNgModelController();
                    }());

                    function initEvents() {
                        element.bind('keydown', onKeydown);
                        element.bind('blur', onBlur);
                        element.bind('submit', onBlur);

                        $scope.$watch('selected', select);
                    }

                    function initAutocompleteDrawer() {
                        // Drawer element used to display predictions
                        var drawerElement = angular.element('<div g-places-autocomplete-drawer></div>'),
                            body = angular.element($document[0].body),
                            $drawer;

                        drawerElement.attr({
                            input: 'input',
                            query: 'query',
                            predictions: 'predictions',
                            active: 'active',
                            selected: 'selected'
                        });

                        $drawer = $compile(drawerElement)($scope);
                        body.append($drawer);  // Append to DOM

                        $scope.$on('$destroy', function() {
                            $drawer.remove();
                        });
                    }

                    function initNgModelController() {
                        controller.$parsers.push(parse);
                        controller.$formatters.push(format);
                        controller.$render = render;
                    }

                    function onKeydown(event) {
                        if ($scope.predictions.length === 0 || indexOf(hotkeys, event.which) === -1) {
                            return;
                        }

                        event.preventDefault();

                        if (event.which === keymap.down) {
                            $scope.active = ($scope.active + 1) % $scope.predictions.length;
                            $scope.$digest();
                        } else if (event.which === keymap.up) {
                            $scope.active = ($scope.active ? $scope.active : $scope.predictions.length) - 1;
                            $scope.$digest();
                        } else if (event.which === 13 || event.which === 9) {
                            if ($scope.forceSelection) {
                                $scope.active = ($scope.active === -1) ? 0 : $scope.active;
                            }

                            $scope.$apply(function () {
                                $scope.selected = $scope.active;

                                if ($scope.selected === -1) {
                                    clearPredictions();
                                }
                            });
                        } else if (event.which === 27) {
                            $scope.$apply(function () {
                                event.stopPropagation();
                                clearPredictions();
                            });
                        }
                    }

                    function onBlur(event) {
                        if ($scope.predictions.length === 0) {
                            return;
                        }

                        if ($scope.forceSelection) {
                            $scope.selected = ($scope.selected === -1) ? 0 : $scope.selected;
                        }

                        $scope.$digest();

                        $scope.$apply(function () {
                            if ($scope.selected === -1) {
                                clearPredictions();
                            }
                        });
                    }

                    function select() {
                        var prediction;

                        prediction = $scope.predictions[$scope.selected];
                        if (!prediction) return;

                        if (prediction.is_custom) {
                            $scope.$apply(function () {
                                $scope.model = prediction.place;
                                $scope.$emit('g-places-autocomplete:select', prediction.place);
                                $timeout(function () {
                                    controller.$viewChangeListeners.forEach(function (fn) { fn(); });
                                });
                            });
                        } else {
                            placesService.getDetails({ placeId: prediction.place_id }, function (place, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.$apply(function () {
                                        $scope.model = place;
                                        $scope.$emit('g-places-autocomplete:select', place);
                                        $timeout(function () {
                                            controller.$viewChangeListeners.forEach(function (fn) { fn(); });
                                        });
                                    });
                                }
                            });
                        }

                        clearPredictions();
                    }

                    function parse(viewValue) {
                        var request;

                        if (!(viewValue && isString(viewValue))) return viewValue;

                        $scope.query = viewValue;

                        request = angular.extend({ input: viewValue }, $scope.options);
                        autocompleteService.getPlacePredictions(request, function (predictions, status) {
                            $scope.$apply(function () {
                                var customPlacePredictions;

                                clearPredictions();

                                if ($scope.customPlaces) {
                                    customPlacePredictions = getCustomPlacePredictions($scope.query);
                                    $scope.predictions.push.apply($scope.predictions, customPlacePredictions);
                                }

                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    $scope.predictions.push.apply($scope.predictions, predictions);
                                }

                                if ($scope.predictions.length > 5) {
                                    $scope.predictions.length = 5;  // trim predictions down to size
                                }
                            });
                        });

                        if ($scope.forceSelection) {
                            return controller.$modelValue;
                        } else {
                            return viewValue;
                        }
                    }

                    function format(modelValue) {
                        var viewValue = "";

                        if (isString(modelValue)) {
                            viewValue = modelValue;
                        } else if (isObject(modelValue)) {
                            viewValue = modelValue.formatted_address;
                        }

                        return viewValue;
                    }

                    function render() {
                        return element.val(controller.$viewValue);
                    }

                    function clearPredictions() {
                        $scope.active = -1;
                        $scope.selected = -1;
                        $scope.predictions = [];
                    }

                    function getCustomPlacePredictions(query) {
                        var predictions = [],
                            place, match, i;

                        for (i = 0; i < $scope.customPlaces.length; i++) {
                            place = $scope.customPlaces[i];

                            match = getCustomPlaceMatches(query, place);
                            if (match.matched_substrings.length > 0) {
                                predictions.push({
                                    is_custom: true,
                                    custom_prediction_label: place.custom_prediction_label || '(Custom Non-Google Result)',  // required by https://developers.google.com/maps/terms Â§ 10.1.1 (d)
                                    description: place.formatted_address,
                                    place: place,
                                    matched_substrings: match.matched_substrings,
                                    terms: match.terms
                                });
                            }
                        }

                        return predictions;
                    }

                    function getCustomPlaceMatches(query, place) {
                        var q = query + '',  // make a copy so we don't interfere with subsequent matches
                            terms = [],
                            matched_substrings = [],
                            fragment,
                            termFragments,
                            i;

                        termFragments = place.formatted_address.split(',');
                        for (i = 0; i < termFragments.length; i++) {
                            fragment = termFragments[i].trim();

                            if (q.length > 0) {
                                if (fragment.length >= q.length) {
                                    if (startsWith(fragment, q)) {
                                        matched_substrings.push({ length: q.length, offset: i });
                                    }
                                    q = '';  // no more matching to do
                                } else {
                                    if (startsWith(q, fragment)) {
                                        matched_substrings.push({ length: fragment.length, offset: i });
                                        q = q.replace(fragment, '').trim();
                                    } else {
                                        q = '';  // no more matching to do
                                    }
                                }
                            }

                            terms.push({
                                value: fragment,
                                offset: place.formatted_address.indexOf(fragment)
                            });
                        }

                        return {
                            matched_substrings: matched_substrings,
                            terms: terms
                        };
                    }

                    function isString(val) {
                        return Object.prototype.toString.call(val) == '[object String]';
                    }

                    function isObject(val) {
                        return Object.prototype.toString.call(val) == '[object Object]';
                    }

                    function indexOf(array, item) {
                        var i, length;

                        if (array === null) return -1;

                        length = array.length;
                        for (i = 0; i < length; i++) {
                            if (array[i] === item) return i;
                        }
                        return -1;
                    }

                    function startsWith(string1, string2) {
                        return toLower(string1).lastIndexOf(toLower(string2), 0) === 0;
                    }

                    function toLower(string) {
                        return (string === null) ? "" : string.toLowerCase();
                    }
                }
            };
        }
    ])


    .directive('gPlacesAutocompleteDrawer', ['$window', '$document', function ($window, $document) {
        var TEMPLATE = [
            '<div class="pac-container" ng-if="isOpen()" ng-style="{top: position.top+\'px\', left: position.left+\'px\', width: position.width+\'px\'}" style="display: block;" role="listbox" aria-hidden="{{!isOpen()}}">',
            '  <div class="pac-item" g-places-autocomplete-prediction index="$index" prediction="prediction" query="query"',
            '       ng-repeat="prediction in predictions track by $index" ng-class="{\'pac-item-selected\': isActive($index) }"',
            '       ng-mouseenter="selectActive($index)" ng-click="selectPrediction($index)" role="option" id="{{prediction.id}}">',
            '  </div>',
            '</div>'
        ];

        return {
            restrict: 'A',
            scope:{
                input: '=',
                query: '=',
                predictions: '=',
                active: '=',
                selected: '='
            },
            template: TEMPLATE.join(''),
            link: function ($scope, element) {
                element.bind('mousedown', function (event) {
                    event.preventDefault();  // prevent blur event from firing when clicking selection
                });

                $window.onresize = function () {
                    $scope.$apply(function () {
                        $scope.position = getDrawerPosition($scope.input);
                    });
                };

                $scope.isOpen = function () {
                    return $scope.predictions.length > 0;
                };

                $scope.isActive = function (index) {
                    return $scope.active === index;
                };

                $scope.selectActive = function (index) {
                    $scope.active = index;
                };

                $scope.selectPrediction = function (index) {
                    $scope.selected = index;
                };

                $scope.$watch('predictions', function () {
                    $scope.position = getDrawerPosition($scope.input);
                }, true);

                function getDrawerPosition(element) {
                    var domEl = element[0],
                        rect = domEl.getBoundingClientRect(),
                        docEl = $document[0].documentElement,
                        body = $document[0].body,
                        scrollTop = $window.pageYOffset || docEl.scrollTop || body.scrollTop,
                        scrollLeft = $window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

                    return {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top + rect.height + scrollTop,
                        left: rect.left + scrollLeft
                    };
                }
            }
        };
    }])

    .directive('gPlacesAutocompletePrediction', [function () {
        var TEMPLATE = [
            '<span class="pac-icon pac-icon-marker"></span>',
            '<span class="pac-item-query" ng-bind-html="prediction | highlightMatched"></span>',
            '<span ng-repeat="term in prediction.terms | unmatchedTermsOnly:prediction">{{term.value | trailingComma:!$last}}&nbsp;</span>',
            '<span class="custom-prediction-label" ng-if="prediction.is_custom">&nbsp;{{prediction.custom_prediction_label}}</span>'
        ];

        return {
            restrict: 'A',
            scope:{
                index:'=',
                prediction:'=',
                query:'='
            },
            template: TEMPLATE.join('')
        };
    }])

    .filter('highlightMatched', ['$sce', function ($sce) {
        return function (prediction) {
            var matchedPortion = '',
                unmatchedPortion = '',
                matched;

            if (prediction.matched_substrings.length > 0 && prediction.terms.length > 0) {
                matched = prediction.matched_substrings[0];
                matchedPortion = prediction.terms[0].value.substr(matched.offset, matched.length);
                unmatchedPortion = prediction.terms[0].value.substr(matched.offset + matched.length);
            }

            return $sce.trustAsHtml('<span class="pac-matched">' + matchedPortion + '</span>' + unmatchedPortion);
        };
    }])

    .filter('unmatchedTermsOnly', [function () {
        return function (terms, prediction) {
            var i, term, filtered = [];

            for (i = 0; i < terms.length; i++) {
                term = terms[i];
                if (prediction.matched_substrings.length > 0 && term.offset > prediction.matched_substrings[0].length) {
                    filtered.push(term);
                }
            }

            return filtered;
        };
    }])

    .filter('trailingComma', [function () {
        return function (input, condition) {
            return (condition) ? input + ',' : input;
        };
    }]);
'use strict';

angular.module('categorie.services', [])
	.service("CategorieService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/categories/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Non trouvé");
					return $q.reject(err);
				})
			},

			getAll:function(){
				return $http.get("/api/categories/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Non trouvé");
					return $q.reject(err);
				})
			},

			add:function(categorie){
				return $http.put("/api/categories/", {categorie:categorie}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(categorie){
				return $http.patch("/api/categories/", {categorie:categorie}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Non trouvé");
					return $q.reject(err);
				})
			},

			del:function(categorie){
				return $http.delete("/api/categories/?id="+categorie._id).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('clients.services', [])
	.service("ClientsService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/clients/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},


			getMe:function(){
				return $http.get("/api/clients/getMe").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			getAll:function(){
				return $http.get("/api/clients/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(client){
				return $http.put("/api/clients/", {client:client}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(clientId, client){
				return $http.patch("/api/clients/", {clientId:clientId, client:client}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			del:function(clientId){
				return $http.delete("/api/clients/", {clientId:clientId}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('configuration.services', [])

	.service("ConfigurationService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/configuration/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(configuration){
				return $http.post("/api/configuration/add", {configuration:configuration}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(configId, configuration){
				return $http.post("/api/configuration/modif", {configId:configId, configuration:configuration}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			del:function(configId){
				return $http.post("/api/configuration/del", {configId:configId}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('ingredients.services', [])

	.service("IngredientsService", ['$q', '$http', function($q, $http){

		return{
			get:function(id){
				return $http.post("/api/ingredients/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			getAll:function(){
				return $http.get("/api/ingredients/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(ingredient){
				return $http.put("/api/ingredients/", {ingredient:ingredient}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(ingredient){
				return $http.patch("/api/ingredients/", {ingredient:ingredient}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			del:function(ingredient){
				return $http.delete("/api/ingredients/?id="+ingredient._id).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('panier.services', [])
	.service("PanierService", ['$q', '$http', function($q, $http){

		return{
			get:function(){
				return $http.get("/api/panier/").then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			},

			getCommande:function(commandeId){
				return $http.post("/api/panier/commande/", {commande:{_id:commandeId}}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			},

			addCommande:function(produit, infos){
				return $http.put("/api/panier/", {produit:produit, infos:infos}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			},


			modifCommande:function(commande, infos){
				return $http.patch("/api/panier/", {commande:commande, infos:infos}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			},

			delCommande:function(commande){
				return $http.delete("/api/panier/?id="+commande._id).then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			},

			sendMail:function(client, panier){
				return $http.post("/api/panier/sendMail", {client:client, panier:panier}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					return $q.reject(err);
				});
			}
		}
	}]);
'use strict';

angular.module('produits.services', ['categorie.services'])

	.service("ProduitsService", ['$q', '$http', 'CategorieService', function($q, $http, $CategorieService){

		return{
			get:function(id){
				return $http.post("/api/produits/get", {id:id}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			getCategories:function(){
				return $CategorieService.getAll();
			},

			getByCategorie:function(categorie){
				return $http.post("/api/produits/getByCategorie", {categorie:categorie}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			getAll:function(){
				return $http.get("/api/produits/getAll").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			add:function(produit){
				return $http.put("/api/produits/", {produit:produit}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			modif:function(produit){
				return $http.patch("/api/produits/", {produit:produit}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			},

			del:function(produit){
				return $http.delete("/api/produits/?id="+produit._id).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("non trouvé");
					return $q.reject(err);
				})
			}
		}
	}]);
'use strict';

angular.module('restaurant.services', [])
	.service("RestaurantService", ['$q', '$http', function($q, $http){

		return{
			getMe:function(){
				return $http.get("/api/restaurant/getMe").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					return $q.reject(err);
				})
			},


			modif:function(restaurant){
				return $http.patch("/api/restaurant/", {restaurant:restaurant}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					return $q.reject(err);
				})
			},


			getAdresse:function(){
				return $http.get("/api/restaurant/getAdresse").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					return $q.reject(err);
				})
			},




			getCalendrier:function(){
				return $http.get("/api/restaurant/getCalendrier").then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					return $q.reject(err);
				})
			},




			// Date / Horraires



			addCalendrier:function(date){
				return $http.put("/api/restaurant/calendrier", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},



			delCalendrier:function(date){
				return $http.delete("/api/restaurant/calendrier", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},



			modifCalendrier:function(date){
				return $http.patch("/api/restaurant/calendrier", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},






			// Fermeture



			addFermeture:function(date){
				return $http.put("/api/restaurant/fermeture", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},



			delFermeture:function(date){
				return $http.delete("/api/restaurant/fermeture", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},



			modifFermeture:function(date){
				return $http.patch("/api/restaurant/fermeture", {date:date}).then(function(response){
					return $q.when(response.data);
				}, function(err){
					if(err.status==404)
						return $q.reject("Objet non trouvés");
					else if(err.status==500)
						return $q.reject("Erreur Inconnus")
					return $q.reject(err);
				})
			},






			
		}
	}]);
'use strict';


myApp.service('anchorSmoothScroll', function(){
    
    this.scrollTo = function(eID) {

        // This scrolling function 
        // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript
        
        var startY = currentYPosition();
        var stopY = elmYPosition(eID);
        var distance = stopY > startY ? stopY - startY : startY - stopY;
        if (distance < 100) {
            scrollTo(0, stopY); return;
        }
        var speed = Math.round(distance / 100);
        if (speed >= 20) speed = 20;
        var step = Math.round(distance / 25);
        var leapY = stopY > startY ? startY + step : startY - step;
        var timer = 0;
        if (stopY > startY) {
            for ( var i=startY; i<stopY; i+=step ) {
                setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                leapY += step; if (leapY > stopY) leapY = stopY; timer++;
            } return;
        }
        for ( var i=startY; i>stopY; i-=step ) {
            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
            leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
        }
        
        function currentYPosition() {
            // Firefox, Chrome, Opera, Safari
            if (self.pageYOffset) return self.pageYOffset;
            // Internet Explorer 6 - standards mode
            if (document.documentElement && document.documentElement.scrollTop)
                return document.documentElement.scrollTop;
            // Internet Explorer 6, 7 and 8
            if (document.body.scrollTop) return document.body.scrollTop;
            return 0;
        }
        
        function elmYPosition(eID) {
            var elm = document.getElementById(eID);
            var y = elm.offsetTop;
            var node = elm;
            while (node.offsetParent && node.offsetParent != document.body) {
                node = node.offsetParent;
                y += node.offsetTop;
            } return y;
        }

    };
    
});