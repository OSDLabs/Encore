/**
 * Module dependencies.
 */

var async = require('async');
var express = require('express.oi');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var errorhandler = require('errorhandler');
var http = require('http');
var path = require('path');
var util = require(__dirname + '/util.js');
var mkdirp = require('mkdirp');
var proxy = require('express-http-proxy');
var basicAuth = require('basic-auth-connect');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var passportSocketio = require('passport.socketio');
var NedbStore = require('nedb-session-store')(require('express-session'));

var app = express().http().io();

// fetch the config directory
app.set('configDir', process.env.configDir || __dirname);

//set the session options
var sessionStore = new NedbStore({
      filename: app.get('configDir')+'/dbs/persistance.db'
    });
var sessionOpts = {
  key: 'express.sid',
  secret: 'keyboard cat',
  store: sessionStore,
  resave: true,
  saveUninitialized: true,
};
app.io.session(sessionOpts);

// all variables to be shared throughout the app
app.set('port', process.env.PORT || 2000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.set('root', __dirname);
app.set('started', Date.now());
app.engine('html', require('swig').renderFile);

async.series([function createDatabaseDirectory(next) {
  // make sure the dbs, users and covers directory is present
  mkdirp(app.get('configDir') + '/dbs/users', function (err) {
      if (err) { console.error(err); }
  });
  mkdirp(app.get('configDir') + '/dbs/covers', next);
}, function databaseDirectoryCreated(next) {
  // attach the db to the app
  require(__dirname + '/db.js')(app);

  // patch the app
  require(__dirname + '/patches.js')(app);

  // attach the config
  app.set('config', require(__dirname + '/config')(app));

  next();
}, function setupAuth(next) {
  var config = app.get('config');

  // auth is only intended for use outside of electron
  if (config.auth &&
      config.auth.username !== undefined &&
      config.auth.password !== undefined &&
      !process.env.ELECTRON_ENABLED) {
    app.use(basicAuth(config.auth.username, config.auth.password));
  }
  next();
}, function setupPassport(next) {
  //Configure passport
  require(__dirname + '/passport_config.js')(app, passport);

  //set auth sessionopts for passportSocketio
  app.io.set('authorization', passportSocketio.authorize({
      cookieParser: cookieParser,
      key: 'express.sid',
      secret: 'keyboard cat',
      store: sessionStore,
      passport: passport,
      success: function (data, accept) {
          accept(null, true);
      },
      fail: function (data, message, error, accept) {
          //accept whether or not user is authorized
          accept(null, true);
      }
  }));

  next();
}, function setupEverythingElse(next) {
  // middleware to use in the app
  app.use(favicon(__dirname + '/static/images/favicon.ico'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.session(sessionOpts));
  app.use('/static', express.static(__dirname + '/static'));

  //initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(require('connect-flash')()); //for error flashes

  // proxy for itunes requests
  app.use('/proxy', proxy('https://itunes.apple.com', {
    forwardPath: function (req, res) {
      return require('url').parse(req.url).path;
    },
  }));

  // development only
  if (app.get('env') == 'development') {
    app.use(errorhandler());
  }

  require(__dirname + '/routes').createRoutes(app);

  app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });

  next();
}]);

module.exports = app;
