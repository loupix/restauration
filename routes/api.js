'use strict';

var express = require('express');
var router = express.Router();


router.use("/categories", require("./api/categories"));
router.use("/clients", require("./api/clients"));
router.use("/configuration", require("./api/configuration"));
router.use("/ingredients", require("./api/ingredients"));
router.use("/produits", require("./api/produits"));
router.use("/restaurant", require("./api/restaurant"));
router.use("/panier", require("./api/panier"));


module.exports = router;