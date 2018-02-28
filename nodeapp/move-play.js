const express = require('express');
const app = express();
const mongo = require("mongodb").MongoClient;
const utils = require("./utils.js");
const bodyParser = require('body-parser');
var N_ROWS = 3;
var N_COLS = 3;
var WIN_NUM = 3;
app.use(bodyParser.json());
app.post('/ttt/play', function(req, res) {
    const username = utils.getUsername(req);
    console.log(username);
    if (!username) utils.sendStatus({statusCode: 403}, null); // User not logged in.
    // Get grid from mongodb.
    getGrid(username, (err, res) => {
        var grid = res;
        console.log("Grid: " + grid);
        const move = req.body.move;
        if (move) {
            // Make client move.
            grid[move] = "X";
            console.log(grid);
            var winner = checkWinner(grid);
            if (winner == " ") {    
                var grid = makeMove(grid);
                winner = checkWinner(grid);
            }
        }
        var data = {grid: grid, winner: winner};
        res.json(data); 
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

function getGrid(username, callback) {
    const query = {username: username};
    const projection = {currentGame: 1};
    utils.mongoFindInUsers(query, projection, (err, res) => {
      if (err) return callback(err, res);
      callback(err, res.currentGame);
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

