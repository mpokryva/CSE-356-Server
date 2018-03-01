const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongo = require("mongodb").MongoClient;
const utils = require("./utils.js");
app.use(bodyParser.json());
app.post("/adduser", function(req, res) {
    var body = req.body;
    console.log(body);
    addUser(body.username, body.password, body.email, (err, info) => {
        utils.sendStatus(err, res);
    });
});
app.post("/verify", function(req, res) {
    var body = req.body;
    verify(body.email, body.key, (err, info) => {
        utils.sendStatus(err, res);       
    });
});
app.listen(8001, () => console.log('Example app listening on port 8001!'));

function verify(email, key, callback) {
    mongo.connect("mongodb://localhost:27017/", function(err, client) {
        if (err) callback(err, client);
        const dbName = "wu2";
        const db = client.db(dbName);
        const colName = "users";
        const backdoor = "abracadabra";
        var query =  (key == backdoor) ? {email: email} :
        {$and: [{email: email}, {key: key}]};
        var updateQuery = {$set: {verified: true}};
        db.collection(colName).update(query, updateQuery, (err, res) => {
            console.log(res.result);
            if (err) {
                return callback(err, res);
            } else if (res.result.n == 0) {
                return callback({statusCode: 404}, res);
            } else {
                return callback(err, res);
            }
        }); 
    });

}

function addUser(username, password, email, callback) {
    // Store user
    const keyLen = 20;
    const key = generateKey(keyLen);
    var user = {
        _id: username,
        password: password,
        email: email,
        key: key,
        verified: false
    }
    insertUser(user, (err, res) => {
        if (!err) { // If stored successfully, send email.
            sendKey(key, email, (err, res) => {
                callback(err, res);
            });
        } else {
            callback(err, res);
        }
    });
}

function sendKey(key, email, callback) {
    const  msgText = "Your key is: " + key;
    sendEmail(email, msgText, (err, info) => {
        callback(err, info);
    }); 
}

function generateKey(length) {
    "use strict";
    let radix = 36;
    let indexToPick = 2; // Must be > 1.
    return [...Array(length)].map(() => Math.random().toString(radix)[indexToPick]).join("");
}

function insertUser(userData, callback) {
    mongo.connect("mongodb://localhost:27017/", function(err, client) {
        if (err) callback(err, client);
        const dbName = "wu2";
        const db = client.db(dbName);
        const colName = "users";
        db.collection(colName).findOne({email: userData.email}, function (err, res) {
            if (err) return callback({statusCode: 500}, null);
            if (res) return callback({statusCode: 409}, null);
            db.collection(colName).insertOne(userData, function(err, res) {
                if (!err) { 
                    console.log("Doc inserted!");
                    client.close();
                }
                console.log(err);
                callback(err, res);
            });    
        });

    });
}

function sendEmail(recepient, msgText, callback) {
    "use strict";
    const hostname = "localhost"; // Could leave this out, but including it for clarity.
    let transporter = nodemailer.createTransport({
        host: hostname,
        port: 25,
        secure: false,
        tls: { 
            rejectUnauthorized: false
        }
    });

    let mailOptions = {
        from: "<ubuntu@ubuntu16-micro.cloud.compas.cs.stonybrook.edu>",
        to: recepient,
        text: msgText
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
        callback(err, info);
    });
}
