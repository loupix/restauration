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