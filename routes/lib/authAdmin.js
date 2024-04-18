const config = require('../../config/environment');
const Promise = require("bluebird");
const path = require("path"),
	fs = require("fs");

let Restaurant = require(path.join(config.root, "schema","User","restaurant"));

module.exports = function(req, res, next){

	if(req.session.isAuthenticated){
		fs.readFile(path.join(config.root, ".restaurantId"), function(err, data){
			if(err) return next(err);

			var id = data.toString();
			Restaurant.findById(id).then(function(restaurant){
				if(req.session.admin_username == restaurant.admin.username && req.session.admin_password == restaurant.admin.password)
					return next();
				else
					return next(new Error("Mot de pass différents"));
			});
		}, function(err){
			return next(err);
		});

	}

	else if(req.body.username !== undefined && req.body.password !== undefined){

		fs.readFile(path.join(config.root, ".restaurantId"), function(err, data){
			if(err) return next(err);

			var id = data.toString();
			Restaurant.findById(id).then(function(restaurant){

				if(restaurant.admin.username != req.body.username) return next(new Error("Mauvais username ou password"));

				restaurant.comparePassword(req.body.password, function(err){
					if(err){
						console.error(err);
						return next(err);
					}else{
						req.session.isAuthenticated=true;
						req.session.admin_password=restaurant.admin.password;
						req.session.admin_username=restaurant.admin.username;
						req.session.save(function(err){
							if(err) return next(err);
							req.toastr.success("Connection effectué");
							console.log("Connection effectué");
							return next();
						});
					}
				});
			}, function(err){
				return next(err);
			});
		});
	}else{
		return next(new Error("Need to be connected"));
	}

};