var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Playlist;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    var playlist = new mongoose.Schema({
        playlistName: String,
        ownerId: Number,
        friends: Array,
        songs: Array
    });

    playlist.set('toJSON', {
        versionKey: false
    });

    Playlist = mongoose.model('Playlist', playlist);
});

mongoose.connect('mongodb://localhost/test');

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.json());

// Add new user playlist
app.post('/playlist/new', function(req, res, next) {
    var playlist = new Playlist({
        ownerId: req.body.ownerId,
        playlistName: req.body.playlistName
    });

    playlist.save(function(err, thor) {
        if (err) return console.error(err);

        res.send('playlist ' + req.body.playlistName + ' added');
    });
});

// Get all user playlists
app.get('/playlists/:userId', function(req, res, next) {
    Playlist.find({ownerId: req.params.userId}, function(err, playlists) {
        if (err) return next(err);
        res.json({
            playlists
        });
    });
});

// Get current playlist
app.get('/playlist/:playlistId', function(req, res, next) {
    Playlist.findById({_id: req.params.playlistId}, function(err, playlist) {
        if (err) return next(err);

        res.json({
            playlist
        });
    });
});

// Add track to playlist
app.post('/playlist/:playlistId', function(req, res, next) {
    Playlist.findById(req.params.playlistId, function(err, playlist) {
        if (err) return next(err);

        var trackId = playlist.songs.length + 1;
        var track = req.body;
        track.trackId = trackId;

        playlist.songs.push(track);
        playlist.save();

        return res.json(playlist);
    });
});

app.delete('/rm-playlist/:playlistId', function(req, res, next) {
    Playlist.findById(req.params.playlistId, function(err, playlist) {
        if (err) return next(err);

        var result = playlist.songs.filter(function(track) {
            return req.body.trackId !== track.trackId;
        });

        playlist.songs = result;

        playlist.save();

        return res.json(playlist);
    });
});

// Add friend to playlist
app.post('/friend/:playlistId', function(req, res, next) {
    Playlist.findById(req.params.playlistId, function(err, playlist) {
        if (err) return next(err);

        var friendId = req.body.friendId;
        playlist.friends.push(friendId);
        playlist.save();

        return res.json(playlist);
    });
});

// Remove friend from playlist
app.delete('/friend/:playlistId', function(req, res, next) {
    Playlist.findById(req.params.playlistId, function(err, playlist) {
        if (err) return next(err);

        var result = playlist.friends.filter(function(friendId) {
            return req.body.friendId !== friendId;
        });

        playlist.friends = result;

        playlist.save();

        return res.json(playlist);
    });
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});