<html>
<head>
<link rel="stylesheet" type="text/css" href="game-style.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script>$(function(){ alert("jQuery is working!")})</script>
<script>
function loadBoard() {
    var grid = document.createElement("table");
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

            });
        }
    }
    document.body.appendChild(grid);    
}
</script>
</head>
<h1>Are you ready to play?</h1>
   <body>  
      <form action = "<?php $_PHP_SELF ?>" method = "post">
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


