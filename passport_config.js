// Configuration file for passportJS

var LocalStrategy = require('passport-local').Strategy;
var validate = require('validator');

module.exports = function(app, passport){

  // Specify a local strategy for passport normal user login
  passport.use('user-login', new LocalStrategy(
    function(username, password, cb){

      // Validate user data
      var error = 0;
      username = validate.trim(username);
      username = username.toLowerCase();
      error += validate.isEmpty(username);
      error += validate.isEmpty(password);

      if (!error) {
        app.db.users.findOne({username: username}, function(err, user) {
          if (err) { return cb(err); }
          if (!user) { return cb(null, false, {message:"Invalid credentials"}); }
          if (user.password != password) { return cb(null, false, {message:"Invalid credentials"}); }
          return cb(null, user);
        });

      } 
      else
        return cb(null, false);
    }
  ));

  // Specify a local strategy for passport normal user signup
  passport.use('user-signup', new LocalStrategy(
    function(username, password, cb){

      // Validate user data
      var error = 0;
      username = validate.trim(username);
      username = username.toLowerCase();
      error += validate.isEmpty(username);
      error += validate.isEmpty(password);

      if (!error) {
        app.db.users.findOne({username: username}, function(err, user) {
          if (err) {
            return cb(err);
          }
          if (user) {
            return cb(null, false, {message:"User already registered"});
          }
          else{
            app.db.users.insert({username: username, password:password});
          }
        });
      }else
        return cb(null, false);
    }
  ));
  
  // Specify a local strategy for passport admin login
  passport.use('admin-login', new LocalStrategy(
    function(username, password, cb){

      // Validate user data
      var error = 0;
      username = validate.trim(username);
      username = username.toLowerCase();
      error += validate.isEmpty(username);
      error += validate.isEmpty(password);

      if (!error) {
        app.db.admins.findOne({username: username}, function(err, user) {
          if (err) { return cb(err); }
          if (!user) { return cb(null, false, {message:"Invalid credentials"}); }
          if (user.password != password) { return cb(null, false, {message:"Invalid credentials"}); }
          return cb(null, user);
        });

      } 
      else
        return cb(null, false);
    }
  ));

  // Specify serialize and deserialize methods for passport
  passport.serializeUser(function(user, cb){
    var sessionUser = user;
    cb(null, sessionUser);
  });
  passport.deserializeUser(function(user, cb){
      cb(null, user);
  });
};
