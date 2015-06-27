/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */
var config = require('../config.json');
var async = require('async');
var request = require('request');
var exec = require('child_process').exec;
var mongoose = require('mongoose');

var getRequest = function(url, callback) {
  var options = {
    url: url
  };
  request(options, callback);
};

/**
 * show chat list
 */
var channelsList = 'https://slack.com/api/channels.list?exclude_archived=1&pretty=1';
var groupsList = 'https://slack.com/api/groups.list?exclude_archived=1&pretty=1';

exports.lists = function(req, res, next) {
  var accessToken = req.headers.token;

  if (!accessToken) {
    var error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    async.waterfall([
      function(callback) {
        getRequest(channelsList + '&token=' + accessToken, function(error, response, body) {
          var json = {};
          if (error) {
            callback(error);
          } else {
            json = JSON.parse(body);
            callback(null, json);
          }
        });
      },
      function(channels, callback) {
        getRequest(groupsList + '&token=' + accessToken, function(error, response, body) {
          var json = {};
          if (error) {
            callback(error);
          } else {
            json = JSON.parse(body);
            callback(null, channels, json);
          }
        });
      },
      function(channels, groups, callback) {
        var lists = [];
        if (channels.ok) {
          channels.channels.forEach(function(element) {
            lists.push({
              'id': element.id,
              'name': element.name
            });
          });
        }
        if (groups.ok) {
          groups.groups.forEach(function(element) {
            lists.push({
              'id': element.id,
              'name': element.name
            });
          });
        }
        res.json(lists);
      }
    ], function(err) {
      if (err) {
        var error = new Error(err);
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      }
    });
  }
};

/**
 * listen
 */
var execPath = './daemon/slack.js';

exports.listen = function(req, res, next) {
  var accessToken = req.headers.token;

  if (!accessToken) {
    var error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    var ExecModel = mongoose.model('Exec');

    ExecModel.find({
      accessToken: accessToken
    }, function(err, data) {
      if (!data || data.length !== 0) {
        var error = new Error();
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      } else {
        var execNew = new ExecModel({
          'accessToken': accessToken
        });
        execNew.save(function(err, data) {
          var cmd = 'forever start --append --uid ' + data._id + ' ' + execPath + ' ' + accessToken;
          exec(cmd, function(error, stdout, stderr) {
            if (error !== null) {
              error = new Error();
              error.status = 400;
              error.message = 'Bad Request';
              next(error);
            } else {
              res.json({
                'ok': true
              });
            }
          });
        });
      }
    });
  }
};

/**
 * listen stop
 */
exports.stop = function(req, res, next) {
  var accessToken = req.headers.token;

  if (!accessToken) {
    var error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    var ExecModel = mongoose.model('Exec');

    ExecModel.findOne({
      accessToken: accessToken
    }, function(err, data) {
      if (!data || data.length === 0) {
        var error = new Error();
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      } else {
        var id = data._id;
        ExecModel.remove({
            '_id': id
          },
          function(err, data) {
            exec('forever stop ' + id,
              function(error, stdout, stderr) {
                if (error !== null) {
                  error = new Error();
                  error.status = 400;
                  error.message = 'Bad Request';
                  next(error);
                } else {
                  res.json({
                    'ok': true
                  });
                }
              });
          });
      }
    });
  }
};

exports.status = function(req, res, next) {
  var accessToken = req.headers.token;

  if (!accessToken) {
    var error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    var ExecModel = mongoose.model('Exec');

    ExecModel.findOne({
      accessToken: accessToken
    }, function(err, data) {
      if (!data || data.length === 0) {
        res.json({
          'ok': false
        });
      } else {
        res.json({
          'ok': true
        });
      }
    });
  }
};

var userLists = 'https://slack.com/api/users.list?pretty=1';

exports.members = function(req, res, next) {
  var accessToken = req.headers.token;

  if (!accessToken) {
    var error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    var MemberModel = mongoose.model('Member');

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
              'image': member.profile.image_72
            });
            memberModel.save(function(err) {
              if (idx === members.members.length) {
                callback(null);
              }
            });
          }
        });
      },
      function(callback) {
        MemberModel.find({}, function(err, data) {
          if (err) {
            callback(err);
          } else {
            res.json(data);
          }
        });
      }
    ], function(err) {
      if (err) {
        var error = new Error();
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      }
    });
  }
};
