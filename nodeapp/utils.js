
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

    sendStatus : function(err, client) {
        if (err) {
            var code = (err.statusCode) ? err.statusCode : 500;
            client.status(code).send({status: "ERROR"});
        } else {
           client.status(200).send({status: "OK"}); 
        }
    },
    /*
     * Upon successful login, returns username in res.
     */
    mongoFindInUsers : function(query, projection, callback) {
        mongo.connect("mongodb://localhost:27017/", (err, client) => {
            if (err) return callback(err, client);
            const dbName = "wu2";
            const db = client.db(dbName);
            const colName = "users";
            db.collection(colName).findOne(query, projection, callback);
        }); 
    },
    
    getUsername : function(req) {
        console.log("req:" + req.cookies);
        return req.cookies[cookieKey];
    }
}

