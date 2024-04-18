'use strict';

var mongoose = require('mongoose');
var Promise = require("bluebird");
var shuffle = require('shuffle-array');

var config = require('./environment');
var path = require("path"),
    fs = require("fs");

var Client = require("../schema/User/client"),
  Restaurant = require("../schema/User/restaurant"),
  Place = require("../schema/User/place"),
  Categorie = require("../schema/Produit/categorie"),
  Ingredients = require("../schema/Produit/ingredient"),
  Produits = require("../schema/Produit/produit"),
  Taille = require("../schema/Produit/taille"),
  Commande = require("../schema/commande"),
  Panier = require("../schema/panier");

console.log("Run Seed");

Client.find({}).remove(err =>{
  if (err) throw err;
  console.log("Clients removed");
});

Place.find({}).remove(err =>{
  if (err) throw err;
  console.log("Places removed");
});


Taille.find({}).remove(err => {
  if (err) throw err;
  console.log("Tailles removed");
});

Produits.find({}).remove(err =>{
  if (err) throw err;
  console.log("Produits removed");
});


Commande.find({}).remove(err =>{
  if (err) throw err;
  console.log("Commandes removed");
});

Panier.find({}).remove(err =>{
  if (err) throw err;
  console.log("Paniers removed");
});


Restaurant.find({}).remove(err =>{
  if (err) throw err;
  console.log("restaurant removed");



  Place.create({
    adresse:"4 rue de la visitation",
    ville:"Metz",
    codePostal:57000,
    latitude:49.1171276,
    longitude:6.1802186,
    googleId:0
  }, function(err, place){
    if (err) throw err;
    console.log("Place created");
    Restaurant.create({
      nom:"Karuna",
      prenom:"Seishen",
      enseigne:"Pizza Innocenti",
      admin:{
        username:"admin",
        password:"admin"
      },
      
      photo:"/images/VUE-LARGE.jpg",
      email:"loic5488@gmail.com",
      telephone:"+336 85 64 98 56",
      adresse:place
    }, function(err, restaurant){
      if (err) throw err;

      fs.writeFile(path.join(config.root, config.fileId), restaurant._id.toString(), err => {
        if (err) throw err;
      });

      console.log("restaurant created");


      Categorie.create({
        nom:"Plat"
      }, function(err, categorie){

        var ingredients = [];
        var promises = [];
        var nomIngredients = ['Fromage', 'Champignon','salade','tomate','oignon','lardons', 'jambon','anchois', 'thon', 'crevette', 'porc']

        for(var i=0;i<10;i++){
          var p = new Promise(function (resolve, reject) {

            Ingredients.create({
              nom:nomIngredients[i],
              prix:i
            }, function(err, ing){
              if(err){reject(err);}
              resolve(ing);
            });

          });
          promises.push(p);
        };


        Restaurant.update({_id:restaurant._id}, 
            {$push:{categories:categorie}},
            {safe: true, upsert: true}, err =>{
              if (err) console.log(err);
        });


        Promise.all(promises).then(function(listIng){
          console.log("Ingredients created");



          Restaurant.update({_id:restaurant._id}, 
              {ingredients:listIng},
              {safe: true, upsert: true, multi:true}, err =>{
                if (err) console.log(err);
          });

          var proTaille = [
            new Promise(function(resolve, reject){
              Taille.create({nom:"small", prix:0}, function(err, taille){
                if(err) return reject(err);
                resolve(taille);
              });
            }),

            new Promise(function(resolve, reject){
              Taille.create({nom:"medium", prix:1}, function(err, taille){
                if(err) return reject(err);
                resolve(taille);
              });
            }),

            new Promise(function(resolve, reject){
              Taille.create({nom:"large", prix:2}, function(err, taille){
                if(err) return reject(err);
                resolve(taille);
              });
            })
          ];


          Promise.all(proTaille).then(function(tailles){
            console.log("taille created");

            for(var i=0;i<9;i++){

              Produits.create({
                nom:"Pizza n°"+i,
                photo:"/images/pizza.png",
                categorie:categorie,
                ingredients:shuffle.pick(listIng, { 'picks': 4 }), // effectur un random / shuffle
                prix:Math.round(Math.random()*20*100)/100,
                tailles:tailles
              }, function(err, produit){
                if (err) throw err;
                Restaurant.update({_id:restaurant._id}, 
                    {$push:{produits:produit}},
                    {safe: true, upsert: true}, err =>{
                      if (err) console.log(err);
                });
              });
            }

          }, err =>{
            throw err;
          });
          
          

          console.log("Produits created");
        }, err =>{
          console.log(err);
        });

      })

      

          

      var promises = [];
      for(var i=0;i<3;i++){ 
        var p = new Promise(function(resolve, reject){
          Client.create({
            nom:"Karuna",
            prenom:"Seishen",
            email:"karuna@gmail.com",
            telephone:"+336 85 64 98 56",
            adresse:place
          }, function(err, client){
            if(err){reject(err);}
            else{resolve(client)}
          });
        });
        promises.push(p);
      };
      console.log("Clients created");

      Promise.all(promises).then(function(clients){
        Restaurant.update({_id:restaurant._id},
          {clients:clients}, { multi: true }, err =>{
            if (err) throw err;
            else console.log("restaurant updated");
          });
      }, err =>{
        console.log(err);
      });




    });


  })
  
});