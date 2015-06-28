/*jslint node: true */
'use strict';

/**
 * Module dependencies.
 */
var config = require('../config.json');
var fs = require('fs');
var async = require('async');
var request = require('request');
var mongoose = require('mongoose');
var exec = require('child_process').exec;

var getToday = function(today) {
  process.env.TZ = 'Asia/Tokyo';
  var d;
  if (today) {
    d = new Date(today);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  } else {
    d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
};

var getTommorow = function(today) {
  process.env.TZ = 'Asia/Tokyo';
  var d, dd;
  if (today) {
    d = new Date(today);
    dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dd.setDate(dd.getDate() + 1);
    return dd;
  } else {
    d = new Date();
    dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dd.setDate(dd.getDate() + 1);
    return dd;
  }
};

exports.make = function(req, res, next) {
  var accessToken = req.headers.token;

  var ChatModel = mongoose.model('Chat');
  var error;

  if (!accessToken) {
    error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    ChatModel.find({
      'date': {
        '$gte': getToday().toUTCString(),
        '$lt': getTommorow().toUTCString()
      }
    }, function(err, data) {
      if (err || !data) {
        var error = new Error();
        error.status = 404;
        error.message = 'Not Found';
        next(error);
      } else {
        var json = JSON.stringify(data);
        fs.writeFile('./data/' + getToday().toISOString().substr(0, 10) + '.json', json, function(err) {
          if (err) {
            res.json({
              'ok': false
            });
          } else {
            var cmd = 'python ./daemon/markov.py ' + accessToken;
            exec(cmd, function(error, stdout, stderr) {
              console.log(stdout);
              console.log(error);
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
          }
        });
      }
    });
  }
};

exports.summary = function(req, res, next) {
  var accessToken = req.headers.token;
  // var channelId = req.params.channelId;
  var searchDate = req.query.date;

  // var ChatModel = mongoose.model('Chat');
  var SummaryModel = mongoose.model('Summary');
  var error;

  if (!accessToken) {
    error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    if (!searchDate) {
      // ChatModel.find({
      //   'date': {
      //     '$gte': getToday().toUTCString(),
      //     '$lt': getTommorow().toUTCString()
      //   }
      // }, function(err, data) {
      //   if (err || !data) {
      //     var error = new Error();
      //     error.status = 404;
      //     error.message = 'Not Found';
      //     next(error);
      //   } else {
      //     var countData = [];
      //     var flg = true;
      //     for (var i = 0, l = data.length; i < l; i++) {
      //       flg = true;
      //       for (var ii = 0, ll = countData.length; ii < ll; ii++) {
      //         if (data[i].user === countData[ii].user) {
      //           countData[ii].count++;
      //           flg = false;
      //           break;
      //         }
      //       }
      //       if (flg) {
      //         countData.push({
      //           'user': data[i].user,
      //           'count': 1
      //         });
      //       }
      //     }
      //     res.json(countData);
      //   }
      // });
      SummaryModel.find({
        'date': {
          '$gte': getToday().toUTCString(),
          '$lt': getTommorow().toUTCString()
        }
      }, function(err, data) {
        if (err || !data) {
          var error = new Error();
          error.status = 404;
          error.message = 'Not Found';
          next(error);
        } else {
          res.json(data);
        }
      });
    } else {
      var today = getToday(searchDate);
      var tommorow = getTommorow(searchDate);
      if (today && tommorow) {
        // ChatModel.find({
        //   'date': {
        //     '$gte': today.toUTCString(),
        //     '$lt': tommorow.toUTCString()
        //   }
        // }, function(err, data) {
        //   if (err || !data) {
        //     var error = new Error();
        //     error.status = 404;
        //     error.message = 'Not Found';
        //     next(error);
        //   } else {
        //
        //   }
        // });
        SummaryModel.find({
          'date': {
            '$gte': today.toUTCString(),
            '$lt': tommorow.toUTCString()
          }
        }, function(err, data) {
          if (err || !data) {
            var error = new Error();
            error.status = 404;
            error.message = 'Not Found';
            next(error);
          } else {
            res.json(data);
          }
        });
      } else {
        error = new Error();
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      }
    }
  }
};

exports.count = function(req, res, next) {
  var accessToken = req.headers.token;
  var channelId = req.params.channelId;
  var searchDate = req.query.date;

  var ChatModel = mongoose.model('Chat');
  var error;

  if (!accessToken || !channelId) {
    error = new Error();
    error.status = 400;
    error.message = 'Bad Request';
    next(error);
  } else {
    if (!searchDate) {
      ChatModel.find({
        'date': {
          '$gte': getToday().toUTCString(),
          '$lt': getTommorow().toUTCString()
        }
      }, function(err, data) {
        if (err || !data) {
          var error = new Error();
          error.status = 404;
          error.message = 'Not Found';
          next(error);
        } else {
          var countData = [];
          var flg = true;
          for (var i = 0, l = data.length; i < l; i++) {
            flg = true;
            for (var ii = 0, ll = countData.length; ii < ll; ii++) {
              if (data[i].user === countData[ii].user) {
                countData[ii].count++;
                flg = false;
                break;
              }
            }
            if (flg) {
              countData.push({
                'user': data[i].user,
                'count': 1
              });
            }
          }
          res.json(countData);
        }
      });
    } else {
      var today = getToday(searchDate);
      var tommorow = getTommorow(searchDate);
      if (today && tommorow) {
        ChatModel.find({
          'date': {
            '$gte': today.toUTCString(),
            '$lt': tommorow.toUTCString()
          }
        }, function(err, data) {
          if (err || !data) {
            var error = new Error();
            error.status = 404;
            error.message = 'Not Found';
            next(error);
          } else {
            var countData = [];
            var flg = true;
            for (var i = 0, l = data.length; i < l; i++) {
              flg = true;
              for (var ii = 0, ll = countData.length; ii < ll; ii++) {
                if (data[i].user === countData[ii].user) {
                  countData[ii].count++;
                  flg = false;
                  break;
                }
              }
              if (flg) {
                countData.push({
                  'user': data[i].user,
                  'count': 1
                });
              }
            }
            res.json(countData);
          }
        });
      } else {
        error = new Error();
        error.status = 400;
        error.message = 'Bad Request';
        next(error);
      }
    }
  }
};
