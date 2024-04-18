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