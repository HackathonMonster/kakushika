/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
  router = express.Router(),
  index = require('../controllers/index.controller');

/* GET home page. */
router.get('/', index.read);

module.exports = router;
