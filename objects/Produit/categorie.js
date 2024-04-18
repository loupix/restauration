'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorieSchema = new Schema({
	nom: {type:String, required: true},
	createdAt: {type: Date},
	updatedAt: {type: Date}
});

module.exports = mongoose.model('Categorie', CategorieSchema);