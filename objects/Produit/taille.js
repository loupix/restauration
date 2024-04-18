'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TailleSchema = new Schema({
	nom: {type:String, required: true},
	prix: {type:Number, required: true}
});

module.exports = mongoose.model('Taille', TailleSchema);