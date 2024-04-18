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