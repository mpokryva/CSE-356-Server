const express = require('express')
const app = express()
    var bodyParser = require('body-parser');
    var N_ROWS = 3;
    var N_COLS = 3;
    var WIN_NUM = 3;
    app.use(bodyParser.json());
    app.post('/', function(req, res) {
        res.send("Hello world!");
    });

app.listen(3000, () => console.log('Example app listening on port 3000!'));

