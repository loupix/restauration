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