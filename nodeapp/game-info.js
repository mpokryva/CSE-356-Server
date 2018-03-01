const express = require('express');
const app = express();
const mongo = require("mongodb").MongoClient;
const utils = require("./utils.js");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.json());
app.post('/listgames', function(req, res) {
    const username = utils.getUsername(req);
    if (!username) return utils.sendStatus({statusCode: 403}, res); // User not logged in.
    getPastGames(username, (err, pastGames) => {
        if (pastGames) {
            pastGames = {games: pastGames};
        }
        utils.sendStatus(err, res, pastGames);
    });
});
app.post("/getgame", (req, res) => {
    const username = utils.getUsername(req);
    if (!username) return utils.sendStatus({statusCode: 403}, res); // User not logged in.
    const gameId = req.body.id;
    getGame(username, gameId, (err, game) => {
        utils.sendStatus(err, res, game);
    }); 
});

app.post("/getscore", (req, res) => {
    const username = utils.getUsername(req);
    if (!username) return utils.sendStatus({statusCode: 403}, res); // User not logged in.
    const gameId = req.body.id;
    getGame(username, gameId, (err, game) => {
        utils.sendStatus(err, res, game);
    }); 
});

app.listen(8003, () => console.log('Example app listening on port 8003!'));

function getPastGames(username, callback) {
    const query = {_id: username};
    const projection = {pastGames: 1};
    const errCode = 404;
    utils.mongoFindInUsers(query, projection, errCode, (err, res) => {
        if (err) {
           if (err.statusCode  == 404) {
                return callback(null, []);
           } else {
               return callback(err, res);
           }
        } else {
            // Found stuff.
            console.log(res);
            // Extract pastGames (bc projection isn't working).
            var pastGames = (res.pastGames) ? res.pastGames : [];
            for (var i = 0 ; i < pastGames.length; i++) {
                //pastGames[i] = pastGames[i].game;
                delete pastGames[i].grid;
                delete pastGames[i].winner;
            }
            return callback(err, pastGames);
        }
    });
}

function getGame(username, id, callback) {
    const query = {_id: username};
    const projection = {pastGames: 1};
    const errCode = 404;
    utils.mongoFindInUsers(query, projection, errCode, (err, res) => {
        if (!err) {
            // Found stuff.
            console.log(res);
            // Extract pastGames (bc projection isn't working).
            var pastGames = res.pastGames;
            var game = null;
            if (pastGames) {
                for (var i = 0; i < pastGames.length; i++) {
                    //pastGames[i] = pastGames[i].game; // Hacking around "game" key error.
                    if (pastGames[i].id == id) { // Game found.
                        game = pastGames[i];
                        delete game.id;
                        delete game.start_date;
                        break;
                    }
                }
            }
            err = (game) ? null : {statusCode: errCode};
            return callback(err, game);
        } else {
            return callback(err, res);
        }
    });
}

function getScore(username, callback) {
    const query = {_id: username};
    const projection = {score: 1}
    utils.mongoFindInUsers(query, projection, (err, res) => {

    });
}

function generateKey(length) {
    "use strict";
    let radix = 36;
    let indexToPick = 2; // Must be > 1.
    return [...Array(length)].map(() => Math.random().toString(radix)[indexToPick]).join("");
}

