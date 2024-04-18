'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../../config/environment'),
	path = require("path"),
    fs = require("fs");

var Place = require("./place");

var UserSchema = new Schema({
	nom: {type:String},
	prenom: {type:String},
	email: {type:String},
	telephone: {type:String},
	adresse:{type: Schema.Types.ObjectId, ref: 'Place'},
	admin:{type: Boolean, default:false},
	createdAt: {type: Date, default: Date.now},
	updatedAt: {type: Date, default: Date.now}
}, { collection : 'users' });

UserSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});


UserSchema.pre('find', function (next) {
	// console.log("init User")
	// console.log(this);
	if(this.adresse !== undefined){
		Place.findById(this.adresse).then(function(place){
			this.adresse = place;
			console.log(place);
			next();
		}, function(err){
			next(err);
		});
	}else {
		next();
	}
});


module.exports = UserSchema;