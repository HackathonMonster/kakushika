/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var config = require('../config.json');

/**
 * Read
 */
exports.read = function(req, res) {
  res.render('index', {
    title: '',
    og_type: 'website',
    og_sitename: config.sitename,
    og_url: config.og_url,
    og_title: '',
    og_image: ''
  });
};
