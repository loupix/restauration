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