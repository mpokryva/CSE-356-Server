<html>
<head>
<link rel="stylesheet" type="text/css" href="style1.css">
<script>
function loadBoard() {
    
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


