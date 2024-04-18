'use strict';

const mongoose = require('mongoose');
const extendSchema = require('mongoose-extend-schema');
const userAbstract = require("./user");
const config = require('../../config/environment'),
	path = require("path"),
    fs = require("fs");

const Place = require("./place");

let ClientSchema = extendSchema(userAbstract, {
	genre: {type:String, default:"M."},
	paiement:{
		enLigne: {type:Boolean, default:false},
		surPlace: {type:Boolean, default:false},
		livraison: {type:Boolean, default:false}
	},
	livraison:{
		surPlace: {type:Boolean, default:false},
		domicile: {type:Boolean, default:false}
	},
	typePaiement:{type:String}
});



ClientSchema.methods.getAdresse = function(){
	var obj = this;
	return new Promise(function(resolve, reject){
		Place.findById(obj.adresse).then(function(place){
			obj.adresse = place;
			resolve(place);
		}, function(err){
			reject(err);
		})
	});
};

module.exports = mongoose.model('Client', ClientSchema);
