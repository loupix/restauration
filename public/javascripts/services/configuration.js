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