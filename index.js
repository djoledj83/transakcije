import express from 'express';
import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import "dotenv/config.js";

const app = express();
const port = process.env.PORT || 3000;  // Dodaj default vrednost za port
const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
const io = new Server(server);  // Konektuj Socket.IO sa Express serverom

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

let messages = [];

const kafka = new Kafka({
    brokers: [process.env.BROKER_1, process.env.BROKER_2, process.env.BROKER_3, process.env.BROKER_4, process.env.BROKER_5, process.env.BROKER_6, process.env.BROKER_7, process.env.BROKER_8],
});
const consumer = kafka.consumer({ groupId: process.env.GROUP_ID });

(async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'event-transaction', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            if (!message || !message.value) {
                console.error("Message or message value is null/undefined");
                return;
            }
            try {
                const value = JSON.parse(message.value.toString());
                const tid = message.key?.toString() || 'Unknown';
                const acquirer = value.properties?.acquirer || 'Unknown';
                const bin = value.properties?.card?.bin || '000000';
                const brand = value.properties?.card?.name || 'N/A';
                const hostResponse = value.properties?.result?.hostResponse || 'N/A';
                const termResponse = value.properties?.result?.terminalResponse || 'N/A';
                const { timestamp, receivedTimestamp, status } = value;

                if (status === 'DECLINED') {
                    messages.push({
                        TID: tid,
                        ACQ: acquirer,
                        BIN: bin,
                        Timestamp_created: timestamp,
                        Timestamp_received: receivedTimestamp,
                        Status: status,
                        Brand: brand,
                        HostResponse: hostResponse,
                        TerminalResponse: termResponse,
                    });

                    console.log({
                        TID: tid,
                        ACQ: acquirer,
                        BIN: bin,
                        Timestamp_created: timestamp,
                        Timestamp_received: receivedTimestamp,
                        Status: status,
                        Brand: brand,
                        HostResponse: hostResponse,
                        TerminalResponse: termResponse,
                    });

                    io.emit('message', {
                        TID: tid,
                        ACQ: acquirer,
                        BIN: bin,
                        Timestamp_created: timestamp,
                        Timestamp_received: receivedTimestamp,
                        Status: status,
                        Brand: brand,
                        HostResponse: hostResponse,
                        TerminalResponse: termResponse,
                    });
                }
            } catch (error) {
                console.error("Error handling Kafka message:", error);
            }
        },
    });
})();

app.get('/', (req, res) => {
    res.render('index', { messages });
});
