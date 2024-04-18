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