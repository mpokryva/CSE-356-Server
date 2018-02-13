<html>
<head>
<link rel="stylesheet" type="text/css" href="style1.css">
</head>
<h1>Are you ready to play?</h1>
   <body>  
      <form action = "<?php $_PHP_SELF ?>" method = "post">
         Name: <input type = "text" name = "name" />
         <input type = "submit" />
      </form>     
   </body>
</html>

<?php
	if ($_POST["name"]) {
		echo "Welcome ". $_POST["name"], date(DATE_RFC822);
	}
?>
