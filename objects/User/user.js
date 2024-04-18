'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	nom: {type:String, required: true},
	prenom: {type:String, required: true},
	email: {type:String},
	telephone: {type:String},
	adresse:{type: Schema.Types.ObjectId, ref: 'Place', required: true}
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('User', UserSchema);