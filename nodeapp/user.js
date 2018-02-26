const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const mongo = require("mongodb").MongoClient;
    app.use(bodyParser.json());
    app.post('/', function(req, res) {
        var body = req.body;
        console.log(body);
        var recepient = "dpokryvailo@cs.stonybrook.edu"
        addUser(body.username, body.password, body.email, (error, info) => {
            if (error) {
               res.sendStatus(500);
            } else {
               res.sendStatus(200); 
            }
        });
    });

app.listen(8000, () => console.log('Example app listening on port 8000!'));



function addUser(username, password, email, callback) {
    // Store user
    var user = {
        _id: username,
        password: password,
        email: email,
        verified: false
    }
    mongoInsert(user, (error, result) => {
        if (!error) { // If stored successfully, send email.
            sendKey(email, (error, result) => {
                callback(error, result);
            });
        } else {
            callback(error, result);
        }
    });
}

function sendKey(email, callback) {
    const keyLen = 20;
    const key = generateKey(keyLen);
    const  msgText = "Your key is: " + key;
    sendEmail(email, msgText, (error, info) => {
        callback(error, info);

    }); 
}

function generateKey(length) {
    "use strict";
    let radix = 36;
    let indexToPick = 2; // Must be > 1.
    return [...Array(length)].map(() => Math.random().toString(radix)[indexToPick]).join("");
}

function mongoInsert(data, callback) {
    mongo.connect("mongodb://localhost:27017/", function(error, client) {
        if (error) callback(error, result);
        const dbName = "wu2";
        const db = client.db(dbName);
        db.collection("users").insertOne(data, function(error, result) {
            if (!error) { 
                console.log("Doc inserted!");
                client.close();
            }
            callback(error, result);
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
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: %s', info.messageId);
        }
        callback(error, info);
    });
}
