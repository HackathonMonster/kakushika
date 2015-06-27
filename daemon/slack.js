/*jslint node: true */
"use strict";

/**
 * Module dependencies.
 */
var config = require('../config');
var fs = require('fs');
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');
var http = require('http');
var WebSocketClient = require('websocket').client;
var client = new WebSocketClient();

if (process.argv.length !== 4) {
  process.exit();
}

var id = process.argv[2];
var accessToken = process.argv[3];

// mongoose connection
var connect = function() {
  var options = {
    server: {
      socketOptions: {
        keepAlive: 1
      }
    }
  };
  mongoose.connect(config.mongodbUrl, options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('connected', console.log);
mongoose.connection.on('disconnected', connect);
process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    process.exit(0);
  });
});

// require models
fs.readdirSync(__dirname + '/../models').forEach(function(file) {
  if (~file.indexOf('.js')) require(__dirname + '/../models/' + file);
});

var ChatModel = mongoose.model('Chat');
var ExecModel = mongoose.model('Exec');
var MemberModel = mongoose.model('Member');

var userLists = 'https://slack.com/api/users.list?pretty=1';
var rtmStart = 'https://slack.com/api/rtm.start?pretty=1';

var errorExit = function(error) {
  console.log('Connect Error: ' + error.toString());
  ExecModel.remove({
    'channelId': id,
    'accessToken': accessToken
  }, function(err) {
    process.exit();
  });
};

var getRequest = function(url, callback) {
  var options = {
    url: url
  };
  request(options, callback);
};

client.on('connectFailed', function(error) {
  errorExit(error);
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');
  connection.on('error', function(error) {
    console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
    console.log('echo-protocol Connection Closed');
  });
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      console.log("Received: '" + message.utf8Data + "'");
      var json = JSON.parse(message.utf8Data);
      var chat = new ChatModel(json);
      chat.save();
    }
  });
});

async.waterfall([
  function(callback) {
    getRequest(userLists + '&token=' + accessToken, function(error, response, body) {
      var json = {};
      if (error) {
        callback(error);
      } else {
        json = JSON.parse(body);
        callback(null, json);
      }
    });
  },
  function(members, callback) {
    var idx = 0;
    members.members.forEach(function(member) {
      idx++;
      if (!member.deleted && !member.is_bot) {
        var memberModel = new MemberModel({
          'id': member.id,
          'name': member.name,
          'real_name': member.real_name,
          'image': member.image_72
        });
        memberModel.save(function() {
          if (idx === members.members.length) {
            callback(null);
          }
        });
      }
    });
  },
  function(callback) {
    getRequest(rtmStart + '&token=' + accessToken, function(error, response, body) {
      var json = {};
      if (error) {
        callback(error);
      } else {
        json = JSON.parse(body);
        callback(null, json);
      }
    });
  },
  function(rtm, callback) {
    client.connect(rtm.url);
  }
], function(err) {
  if (err) {
    errorExit(err);
  }
});
