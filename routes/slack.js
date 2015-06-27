/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
  router = express.Router(),
  slack = require('../controllers/slack.controller');

/* GET home page. */
router.get('/lists', slack.lists);
router.get('/listen', slack.listen);
router.get('/stop', slack.stop);
router.get('/status', slack.status);
router.get('/members', slack.members);

module.exports = router;
