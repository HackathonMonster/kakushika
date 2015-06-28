/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
  router = express.Router(),
  statics = require('../controllers/statics.controller');

/* GET home page. */
router.get('/make', statics.make);
router.get('/summary', statics.summary);
router.get('/count/:channelId', statics.count);

module.exports = router;
