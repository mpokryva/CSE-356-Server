
const express = require('express');
const app = express();
const mongo = require("mongodb").MongoClient;
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cookieParser())
const cookieKey = "username";
const ttl = 60 * 15 * 1000; // 15 mins.
const options = {maxAge: ttl, secure: false};

module.exports = {

    sendStatus : function(err, client, data) {
        if (err) {
            var code = (err.statusCode) ? err.statusCode : 500;
            console.log("In utils.sendStatus, with code " + code);
            client.status(code).json({status: "ERROR"});
        } else {
           if (data) {
               data.status = "OK";
           } else {
               data = {status: "OK"};
           }
           client.status(200).json(data); 
        }
    },
    /*
     * Upon successful login, returns username in res.
     */
    mongoFindInUsers : function(query, projection, errCode, callback) {
        mongo.connect("mongodb://localhost:27017/", (err, client) => {
            if (err) return callback(err, client);
            const dbName = "wu2";
            const db = client.db(dbName);
            const colName = "users";
            db.collection(colName).findOne(query, projection, (err, res) => {
                var retCode  = (err) ? 500 : 200;
                if (retCode != 500) {
                    retCode = (res) ? null : errCode;
                }
                err = (retCode) ? {statusCode: retCode} : null;
                console.log(res);
                if (err) return callback(err, res);
                callback(err, res); 
            });

        }); 
    },

    mongoUpdateUsers : function(query, update, callback) {
        mongo.connect("mongodb://localhost:27017/", (err, client) => {
            if (err) return callback(err, client);
            const dbName = "wu2";
            const db = client.db(dbName);
            const colName = "users";
            db.collection(colName).update(query, update, callback);
        }); 
    },
    
    getUsername : function(req) {
        return req.cookies[cookieKey];
    }
}

