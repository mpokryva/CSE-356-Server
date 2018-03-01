const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongo = require("mongodb").MongoClient;
const cookieParser = require("cookie-parser");
const utils = require("./utils.js");
app.use(bodyParser.json());
app.use(cookieParser());
const cookieKey = "username";
const ttl = 60 * 15 * 1000; // 15 mins.
const options = {maxAge: ttl, secure: false};
app.post("/login", (req, res) => {
    var body = req.body;
    console.log("req: " + JSON.stringify(body));
    // If cookies aren't set, log in.
    const reqCookie = req.cookies[cookieKey];
    console.log(req.cookies);
    console.log("ReqCookie: " + reqCookie);
    if (reqCookie != body.username) {
        login(body.username, body.password, (err, profile) => {
            if (profile) {
                const username = profile._id;
                console.log("Log in successful. Settings cookies");
                res.cookie(cookieKey, username, options); 
            } else {
                console.log("Login unsucessful.");
                console.log("Err: " + err.statusCode);
            }
            utils.sendStatus(err, res);
        });
    } else {
        //res.clearCookie(cookieKey, options);
        console.log("Cookie already set!");
        utils.sendStatus(null, res); // Cookie set. Login successful by default.
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie(cookieKey, options); 
    utils.sendStatus(null, res);
});

app.listen(8002, () => console.log('Example app listening on port 8002!'));

/*
 * Upon successful login, returns username in res.
 */
function login(username, password, callback) {
    console.log("Trying login for: " + username);
    const query = {$and: [{_id: username}, {password: password}, {verified: true}]};
    errCode = 403;
    utils.mongoFindInUsers(query, null, errCode, (err, res) => {
        callback(err, res);
    });
}

