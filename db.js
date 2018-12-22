var Datastore = require('nedb');

function getUserPlaylist(userId) {
    var db = new Datastore({ filename: app.get('configDir') + '/dbs/users/'+ userId +'.db' , autoload: true });
    return db;
}

module.exports = function(app) {
  app.db = {};
  app.db.connected_users = {};
  app.db.songs = new Datastore({ filename: app.get('configDir') + '/dbs/songs.db', autoload: true });
  app.db.playlists = new Datastore({ filename: app.get('configDir') + '/dbs/playlists.db', autoload: true });
  app.db.settings = new Datastore({ filename: app.get('configDir') + '/dbs/settings.db', autoload: true });
  app.db.users = new Datastore({ filename: app.get('configDir') + '/dbs/users.db', autoload: true });
  app.db.admins = new Datastore({ filename: app.get('configDir') + '/dbs/admins.db', autoload: true });
  app.db.getUserPlaylist = getUserPlaylist;
};
