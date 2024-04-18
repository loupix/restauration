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