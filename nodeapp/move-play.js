const express = require('express');
const app = express();
const mongo = require("mongodb").MongoClient;
const utils = require("./utils.js");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.json());
var N_ROWS = 3;
var N_COLS = 3;
var WIN_NUM = 3;
app.post('/ttt/play', function(req, res) {
    const username = utils.getUsername(req);
    if (!username) return utils.sendStatus({statusCode: 403}, res); // User not logged in.
    // Get grid from mongodb.
    getGame(username, (err, game) => {
        if (err && err.statusCode == 500) utils.sendStatus(err, res);
        if (!game) { // New game.
            var grid = [];
            var game = {};
            for (var i = 0; i < N_ROWS * N_COLS; i++) {
               grid[i] = " ";
            } 
        } else {
            var grid = game.grid;
        }
        console.log("Grid: " + grid);
        const move = req.body.move;
        if (move) {
            // Make client move.
            grid[move] = "X";
            console.log("PostClient: " + grid);
            var winner = checkWinner(grid);
            if (winner == " ") {    
                grid = makeMove(grid);
                console.log("PostServer: " + grid);
                winner = checkWinner(grid);
            }
        }
        game.grid = grid;
        game.winner = winner;
        storeGame(username, game, (err, info) => {
            var data = {grid: grid, winner: winner};
            utils.sendStatus(err, res, data);
        });
    });

});

app.listen(8000, () => console.log('Example app listening on port 8000!'));

function makeMove(grid) {
    for (var i = 0; i < grid.length; i++) {
        if (grid[i] == " ") {
            grid[i] = "O";
            break;
        }
    }
    return grid;
}

function storeGame(username, game, callback) {
    const query = {_id: username};
    var update;
    if (game.winner == " ") {
        // Ongoing game.
        game.start_date = Date.now();
        update = {$set: {currentGame: game}};
    } else {
        // Game just finished.
        update = {$unset: {currentGame: 1}, $push: {pastGames: {game}}};
    }
    utils.mongoUpdateUsers(query, update, (err, res) => {
        if (err) return callback(err, res);
        if (res.result.n == 1 && res.result.nModified == 1) {
            return callback(null, res);
        } else {
            return callback({statusCode: 500}, res);
        }
    });
}

function getGame(username, callback) {
    const query = {_id: username};
    const projection = {currentGame: 1};
    utils.mongoFindInUsers(query, projection, 400, (err, res) => {
        const ret = (err) ? null : res.currentGame;
        callback(err, ret);
    });
}

function checkWinner(grid) {
    var winner = checkWinnerRC(grid, true);
    console.log("Checking rows...");
    if (winner == " ") {
        winner = checkWinnerRC(grid, false);
        console.log("Checking cols...");
        if (winner == " ") {
            console.log("Checking diagonals...");
            winner = checkWinnerDiag(grid);
            return winner;
        } else {
            return winner;
        }
    } else {
        return winner;
    }
}

function checkWinnerRC(grid, checkRows) {
    // Check for winner in rows.
    var outerStop = (checkRows) ? N_ROWS : N_COLS;
    var innerStop = (checkRows) ? N_COLS : N_ROWS;
    for (var i = 0; i < outerStop; i++) {
        var winner = " ";
        var prev = null;
        for (var j = 0; j < innerStop; j++) {
            var row = (checkRows) ? i : j;
            var col = (checkRows) ? j : i;
            var index = getIndex(row, col, N_ROWS, N_COLS);
            if (grid[index] != " " && (prev == null || grid[index] == prev)) {
                // Keep searching this row;
                prev = grid[index];
            } else {
                break;
            }
            if (j + 1 == WIN_NUM) { // Found a winner!
                console.log("Found a winner!");
                return grid[index];
            }
        }
    }
    return " ";

}

function checkWinnerDiag(grid) {
    var topLeft = grid[getIndex(0, 0, N_ROWS, N_COLS)];
    var topRight = grid[getIndex(0, 2, N_ROWS, N_COLS)];
    var botLeft = grid[getIndex(2, 0, N_ROWS, N_COLS)];
    var botRight = grid[getIndex(2, 2, N_ROWS, N_COLS)];
    var center = grid[getIndex(1, 1, N_ROWS, N_COLS)];
    if (topLeft != " " && topLeft == center && center == botRight) {
        return topLeft;
    } else if (topRight != " " && topRight == center && center == botLeft) {
        return topRight;
    } else {
        return " ";
    }
}


function getRow(index, nCols) {
    return Math.floor(index / nCols);
}

function getIndex(row, col, nCols, nRows) {
    return (row * nCols) + col;
}

function getCol(index, nCols) {
    return index % nCols;
}

