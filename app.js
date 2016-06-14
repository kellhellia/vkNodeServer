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
        friendsIds: Array,
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

app.use(bodyParser.json())

// app.get('/playlists', function(req, res, next) {
//     Playlist.find(function(err, playlists) {
//         if (err) return next(err);
//         res.json({
//             playlists
//         });
//     });
// });

app.get('/playlists/:userId', function(req, res, next) {
    Playlist.find({ownerId: req.params.userId}, function(err, playlists) {
        if (err) return next(err);
        res.json({
            playlists
        });
    });
});

app.get('/playlist/:playlistId', function(req, res, next) {
    Playlist.find({_id: req.params.playlistId}, function(err, playlist) {
        if (err) return next(err);
        res.json({
            playlist
        });
    });
});

app.post('/playlist/:playlistId', function(req, res, next) {
    Playlist.findByIdAndUpdate(req.params.playlistId, { $push: { "songs": req.body } }, function(err, result){
        if(err){
            console.log(err);
        }
        console.log("RESULT: " + result);
    });
});

app.post('/playlist/new', function(req, res, next) {
    var playlist = new Playlist({
        ownerId: req.body.ownerId,
        playlistName: req.body.playlistName
    });

    playlist.save(function(err, thor) {
        if (err) return console.error(err);

        res.send('playlist' + req.body.playlistName + ' added');
    });
});

app.get('/', function (req, res, next) {
    res.json(
        {
            "article": [
                {
                    "title": "article - 1",
                    "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo nobis eum deserunt ad. Corrupti maxime quisquam velit unde, eum ab magni! Incidunt nam maiores dolores ullam vitae, adipisci fugit omnis!"
                }
            ],
            "article2": [
                {
                    "title": "article - 2",
                    "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo nobis eum deserunt ad. Corrupti maxime quisquam velit unde, eum ab magni! Incidunt nam maiores dolores ullam vitae, adipisci fugit omnis!"
                }
            ],
            "article3": [
                {
                    "title": "article - 3",
                    "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo nobis eum deserunt ad. Corrupti maxime quisquam velit unde, eum ab magni! Incidunt nam maiores dolores ullam vitae, adipisci fugit omnis!"
                }
            ],
            "article4": [
                {
                    "title": "article - 4",
                    "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo nobis eum deserunt ad. Corrupti maxime quisquam velit unde, eum ab magni! Incidunt nam maiores dolores ullam vitae, adipisci fugit omnis!"
                }
            ]
        }
    );
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});