const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongo = require("mongodb").MongoClient;
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use(cookieParser())
const cookieKey = "username";
const ttl = 60 * 15 * 1000; // 15 mins.
const options = {maxAge: ttl, secure: false};
app.post("/login", (req, res) => {
    var body = req.body;
    // If cookies aren't set, log in.
    const reqCookie = req.cookies[cookieKey];
    console.log(req.cookies);
    console.log("ReqCookie: " + reqCookie);
    if (!reqCookie) {
        login(body.username, body.password, (err, username) => {
            if (username) {
                res.cookie(cookieKey, username, options); 
            }
            sendStatus(err, res);
        });
    } else {
        //res.clearCookie(cookieKey, options);
        sendStatus(null, res); // Cookie set. Login successful by default.
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie(cookieKey, options); 
    sendStatus(null, res);
});

app.listen(8002, () => console.log('Example app listening on port 8002!'));

function sendStatus(err, client) {
    if (err) {
        var code = (err.statusCode) ? err.statusCode : 500;
        client.status(code).send({status: "ERROR"});
    } else {
       client.status(200).send({status: "OK"}); 
    }
}
/*
 * Upon successful login, returns username in res.
 */
function login(username, password, callback) {
    mongo.connect("mongodb://localhost:27017/", (err, client) => {
        const dbName = "wu2";
        const db = client.db(dbName);
        const colName = "users";
        const query = {$and: [{_id: username}, {password: password}, {verified: true}]};
        db.collection(colName).findOne(query, (err, res) => {  
            var code = (err) ? 500 : 200;
            if (code != 500) {
                code = (res) ? null : 400; 
            }
            code = (code) ? {statusCode: code} : null;
            console.log(res);
            // Only store cookies if login was successful (code == null).
            const username = (!code) ? res._id : null;
            callback(code, username);
        });
    }); 
}

