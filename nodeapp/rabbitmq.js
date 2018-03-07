const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const amqp = require("amqplib/callback_api");
// listen - consumer.
// speak - producer.

app.post("/listen", (err, res) => {
    amqp.connect("amqp://localhost", (err, conn) => {
        conn.createChannel((err, conn) => {
            var q = "hw3";
            ch.assertQueue(q, {durable: false, exclusive: true});
            ch.sendToQueue(q, new Buffer("Hello World!"));
            console.log("[x] Sent Hello World!");
        });
        setTimeout(function() {
            conn.close();
            process.exit(0);
        }, 500);
    });
});

app.post("/speak", (err, res) => {
    amqp.connect("amqp://localhost", (err, conn) => {
        conn.createChannel((err, ch) => {
            var q = "hello";
            ch.assertQueue(q, {durable: false, exclusive: true});

            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
            ch.consume(q, (msg) => {
                console.log("[x] Received %s", msg.content.toString());
            }, {noAck: true});
        });
    });
});



