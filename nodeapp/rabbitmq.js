const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const amqp = require("amqplib/callback_api");
app.use(bodyParser.json());
// listen - consumer.
// speak - producer. 
const exName = "hw3";
app.post("/listen", (req, res) => {
    amqp.connect("amqp://localhost", (err, conn) => {
        //console.log("POST to listen.");
        conn.createChannel((err, ch) => {
            // Create exchange.
            ch.assertExchange(exName, "direct");
            // Create queue.
            ch.assertQueue("", {exclusive: true}, (err, q) => {
                const keys = req.body.keys;
                console.log(keys);
                keys.forEach((key) => {
                    console.log("Binding to: " + key);
                    ch.bindQueue(q.queue, exName, key);
                });
                ch.consume(q.queue, (msg) => { // Listen for message and return it.
                    console.log("Received message: " + msg);
                    const ret = {msg: msg.content.toString()};
                    console.log("Closing connection.");
                    conn.close();
                    res.send(ret);
                }); 
            });
        });
    });
});

app.post("/speak", (req, res) => {
    amqp.connect("amqp://localhost", (err, conn) => {
        //console.log("POST to speak.");
        conn.createChannel((err, ch) => {
            // Create exchange if not already created.
            //ch.deleteExchange(exName);
            ch.assertExchange(exName, "direct");
            const body = req.body;
            const key = body.key;
            const msg = body.msg;
            console.log("Key : %s, Message: %s", key, msg);
            ch.publish(exName, key, new Buffer(msg)); // Publish message with key.
            res.send(); // Send 200 if reached this point.
        });
        //setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });
});

app.listen(8004, () => console.log("App listening on port 8004!")); 

