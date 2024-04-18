myApp.controller('MainCtrl', ['$scope', '$rootScope', 'anchorSmoothScroll', function($scope, $rootScope, anchorSmoothScroll){

	$rootScope.loading = true;

	$scope.gotoAnchor = function(hash) {
		anchorSmoothScroll.scrollTo(hash);
		return false;
	};

}]);

myApp.controller("accueilCtrl", ['$scope', '$rootScope', '$timeout', 'anchorSmoothScroll', '$sce', '$mdDialog', '$location', '$cookies', 'ProduitsService', 'PanierService', 'IngredientsService', 'ClientsService',
	function($scope, $rootScope, $timeout, anchorSmoothScroll, $sce, $mdDialog, $location, $cookies, $ProduitsService, $PanierService, $IngredientsService, $ClientsService){

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
			$cookies.put('client', data.client);
			$cookies.put('panier', data.panier);
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
	      	ProduitsService:$ProduitsService, PanierService:$PanierService, ClientsService:$ClientsService, cookieStore:$cookies },
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











myApp.controller("panierCtrl", ['$scope', '$rootScope', '$location', '$route', '$cookies', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $route, $cookies, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){
		$scope.infosCmds = {};
		$scope.panier = null;
		$scope.commandes = [];
		$scope.client = null;
		$scope.restaurant = null;
		$scope.livraison = null;

		$scope.go = function (path) {$location.path(path);};

		$scope.setLivraison = function(livraison){
			$cookies.put('livraison', livraison);
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


				if($cookies.get("livraison"))
					$scope.setLivraison($cookies.get("livraison"));
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
	      	PanierService:$PanierService, ClientsService:$ClientsService, cookieStore:$cookies },
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









myApp.controller("livraisonCtrl", ['$scope', '$rootScope', '$location', '$route', '$cookies', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $route, $cookies, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


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

		if($cookies.get("choixPaiement"))
			$scope.choixPaiement = $cookies.get("choixPaiement");
		if($cookies.get("livraison"))
			$scope.livraison = $cookies.get("livraison");
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








myApp.controller("paiementCtrl", ['$scope', '$rootScope', '$location', '$cookies', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $cookies, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


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

		if($cookies.get("choixPaiement"))
			$scope.choixPaiement = $cookies.get("choixPaiement");
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
		$cookies.put('choixPaiement', choix);
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







myApp.controller("validationCtrl", ['$scope', '$rootScope', '$location', '$cookies', 'ProduitsService', 'IngredientsService', 'PanierService', 'ClientsService', 
	function($scope, $rootScope, $location , $cookies, $ProduitsService, $IngredientsService, $PanierService, $ClientsService){


	$scope.commandes = [];
	$scope.panier = null;
	$scope.client = null;
	$scope.restaurant = null;
	$scope.choixPaiement = false;


}]);


