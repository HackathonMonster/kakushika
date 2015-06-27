/*jslint node: true */
"use strict";

var express = require('express'),
  app = express(),
  fs = require('fs'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  ECT = require('ect'),
  compression = require('compression'),
  helmet = require('helmet'),
  config = require('./config');

// view engine setup
app.engine('ect', ECT({
  watch: true,
  root: __dirname + '/views',
  ext: '.ect'
}).render);
app.set('view engine', 'ect');

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
fs.readdirSync(__dirname + '/models').forEach(function(file) {
  if (~file.indexOf('.js')) require(__dirname + '/models/' + file);
});

// Use helmet to secure Express headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  defaultSrc: ["'self'", config.host]
}));

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 2592000000
}));

// route settings
var routes = {};
routes.index = require('./routes/index');
routes.slack = require('./routes/slack');

app.use('/', routes.index);
app.use('/slack', routes.slack);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
