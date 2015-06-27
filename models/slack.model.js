/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var chatSchema = new Schema({
  channel: String,
  user: String,
  text: String,
  date: Date
}, {
  collection: 'chatSlack'
});

module.exports = mongoose.model('Chat', chatSchema);

var execSchema = new Schema({
  channelId: String,
  accessToken: String
}, {
  collection: 'execSlack'
});

module.exports = mongoose.model('Exec', execSchema);

var memberSchema = new Schema({
  id: {
    type: String,
    unique: true
  },
  name: String,
  real_name: String,
  image: String
}, {
  collection: 'memberSlack'
});

module.exports = mongoose.model('Member', memberSchema);
