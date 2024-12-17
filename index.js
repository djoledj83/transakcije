const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Kafka } = require('kafkajs')
const fs = require('fs');
const bodyParser = require('body-parser')
const path = require('path');
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;  // Dodaj default vrednost za port
const io = socketIO(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());

let messages = [];
let masterCount = 0;
let dinaCount = 0;
let visaCount = 0;

///////////////////// Učitaj binovi.json //////////////
let binovi = [];
const binFilePath = path.join(__dirname, '/public/binovi.json');

try {
    const binData = fs.readFileSync(binFilePath, 'utf8');
    binovi = JSON.parse(binData);
    console.log("BIN podaci su uspešno učitani.");
} catch (err) {
    console.error("Greška pri učitavanju binovi.json:", err);
}

//////////////////// Ucitani binovi /////////////////

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


                // Pronađi banku na osnovu BIN vrednosti
                const bankaInfo = binovi.find(item => item.bin === bin);
                const banka = bankaInfo ? bankaInfo.bank : 'Nepoznata banka';



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
                        MasterCount: masterCount,
                        DinaCount: dinaCount,
                        VisaCount: visaCount,
                        Banka: banka,
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
                        MasterCount: masterCount,
                        DinaCount: dinaCount,
                        VisaCount: visaCount,
                        Banka: banka,
                    });


                    if (brand === 'MASTERCARD') {
                        masterCount++;
                    } else if (brand === 'DINACARD') {
                        dinaCount++;
                    } else if (brand === 'VISA') {
                        visaCount++;
                    }


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
                        MasterCount: masterCount,
                        DinaCount: dinaCount,
                        VisaCount: visaCount,
                        Banka: banka,
                    });
                }
            } catch (error) {
                console.error("Error handling Kafka message:", error);
            }
        },
    });
})();

app.get('/', (req, res) => {
    const reversedMessages = messages.slice().reverse();
    res.render('index', { messages: reversedMessages });
});
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});