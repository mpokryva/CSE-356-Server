const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
    app.use(bodyParser.json());
    app.post('/', function(req, res) {
        var body = req.body;
        console.log(body);
        var username = body.username;
        console.log(username);
        sendEmail();
        //testEmail();
    });

app.listen(8000, () => console.log('Example app listening on port 8000!'));


function sendEmail(recepient, msgText) {
    "use strict";
    var hostname = "localhost"; // Could leave this out, but including it for clarity.
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
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}
