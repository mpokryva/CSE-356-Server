<html>
<head>
<link rel="stylesheet" href="game-style.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script>
var N_ROWS = 3;
var N_COLS = 3;
var size = 9;
var gameArr = [];
for (var i = 0; i < size; i++) {
    gameArr.push(" ");
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

function loadBoard() {
    var grid = document.createElement("table");
    grid.setAttribute("id", "grid");
    var rows = 3;
    var cols = 3;
    for (var r = 0; r < rows; r++) {
        var tr = grid.appendChild(document.createElement("tr"));
        for (var c = 0; c < cols; c++) {
            var cell = tr.appendChild(document.createElement("td"));
            cell.addEventListener("click", function() {
                // Make AJAX request.
                var row = this.parentNode.rowIndex;
                var col = this.cellIndex;
                // Need to implement click validation.
                var index = getIndex(row, col, N_ROWS, N_COLS);
                gameArr[index] = "X";
                var data = JSON.stringify({grid: gameArr});
                //console.log(data);
                $.ajax({
                url: "/ttt/play",
                    type: "POST",
                    data: data,
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    success: function(data) {
                        handleResponse(data);
                    }
                });
            });
        }
    }
    document.body.appendChild(grid);    
}

function handleResponse(data) {
    gameArr = data.grid;
    console.log("Grid:" + gameArr);
    updateBoard();
    var winner = data.winner;
    console.log("Winner: " + winner);
    var moveCount = 0;
    for (var i = 0; i < gameArr.length; i++) {
        if (gameArr[i] != " ") {
            moveCount++;
        }
    }
    if (winner != " ") {
        alert("Game over!\n" + winner + " won.");
        resetBoard(gameArr);
    } else if (moveCount == gameArr.length) {
        alert("It's a draw!");
        resetBoard(gameArr);
    }
}

function resetBoard() {
    for (var i = 0; i < gameArr.length; i++) {
        gameArr[i] = " ";
    }
    updateBoard();
}

function updateBoard() {
    var grid = document.getElementById("grid");
    for (var i = 0; i < gameArr.length; i++) {
        var row = getRow(i, N_COLS);
        var col = getCol(i, N_ROWS);
        grid.rows[row].cells[col].innerHTML = gameArr[i];
    }
}

</script>
</head>
<h1 align="center">Are you ready to play?</h1>
   <body>  
      <form align="center" action = "<?php $_PHP_SELF ?>" method = "post">
         Name: <input type = "text" name = "name" />
         <input type = "submit" />
      </form>
   </body>

<?php
if ($_POST["name"]) {
    echo "Hello ". $_POST["name"], ", ", date(DATE_RFC822);
    echo '<script> loadBoard(); </script>';
}
?>
</html>


