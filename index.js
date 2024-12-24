const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { Kafka } = require('kafkajs');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const io = socketIO(server);

// Konfiguracija Express-a
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());


// Globalne promenljive
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
    console.log("BIN podaci učitani.");
} catch (err) {
    console.error("Greška pri učitavanju binovi.json:", err);
}

//////////////////// Ucitani binovi /////////////////

// Funkcija za generisanje naziva fajla sa datumom
const generateFileName = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Dodaj 0 ako je potrebno
    const day = String(date.getDate()).padStart(2, '0');
    return `kafka_messages_${year}-${month}-${day}.csv`;
};

// Funkcija za kreiranje CSV tabele
const createCsvWriter = () => {
    const fileName = generateFileName();
    const filePath = `data/${fileName}`;

    // Proveri da li fajl postoji
    const fileExists = fs.existsSync(filePath);

    return createObjectCsvWriter({
        path: filePath,
        header: [
            { id: 'Vreme', title: 'vremeUpisa' },
            { id: 'TID', title: 'TID' },
            { id: 'ACQ', title: 'Acquirer' },
            { id: 'BIN', title: 'BIN' },
            { id: 'Timestamp_created', title: 'Timestamp Created' },
            { id: 'Timestamp_received', title: 'Timestamp Received' },
            { id: 'Status', title: 'Status' },
            { id: 'Brand', title: 'Brand' },
            { id: 'HostResponse', title: 'Host Response' },
            { id: 'TerminalResponse', title: 'Terminal Response' },
            { id: 'MasterCount', title: 'Master Count' },
            { id: 'DinaCount', title: 'Dina Count' },
            { id: 'VisaCount', title: 'Visa Count' },
            { id: 'Banka', title: 'Banka' },
        ],
        append: fileExists, // Dodaj na fajl ako postoji, inače kreiraj novi sa header-ima
    });
};

let csvWriter = createCsvWriter(); // Inicijalni CSV

// Kafka konfiguracija
const kafka = new Kafka({
    brokers: [
        process.env.BROKER_1,
        process.env.BROKER_2,
        process.env.BROKER_3,
        process.env.BROKER_4,
        process.env.BROKER_5,
        process.env.BROKER_6,
        process.env.BROKER_7,
        process.env.BROKER_8,
    ].filter(Boolean), // Ukloni prazne vrednosti
});
const consumer = kafka.consumer({ groupId: process.env.GROUP_ID });

// Funkcija za obradu Kafka poruke
const processKafkaMessage = async (message) => {
    if (!message || !message.value) {
        console.error("Invalid Kafka message: Message or value is undefined");
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

        const isoDate = timestamp;
        const date = new Date(isoDate);

        // Extract parts
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        // const seconds = String(date.getSeconds()).padStart(2, '0');

        // Format as desired
        const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;

        // Pronađi banku na osnovu BIN vrednosti
        const bankaInfo = binovi.find(item => item.BIN === bin);
        const banka = bankaInfo ? bankaInfo.BANK : 'Nepoznata banka';

        if (hostResponse === '903') {



        }

        if (status === 'DECLINED') {
            if (brand === 'MASTERCARD') masterCount++;
            else if (brand === 'DINACARD') dinaCount++;
            else if (brand === 'VISA') visaCount++;

            const messageData = {
                TID: tid,
                ACQ: acquirer,
                BIN: bin,
                Vreme: formattedDate,
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
            };

            // Dodaj poruku u listu i emituje preko Socket.IO
            messages.push(messageData);
            io.emit('message', messageData);

            // Proveri da li treba kreirati novi fajl
            const currentFileName = generateFileName();
            if (!fs.existsSync(currentFileName)) {
                csvWriter = createCsvWriter(); // Kreiraj novi CSV za novi dan
            }

            // Zapiši poruku u CSV fajl
            await csvWriter.writeRecords([messageData]);

            console.log("Processed and saved Kafka message:", messageData);
        }
    } catch (error) {
        console.error("Error processing Kafka message:", error);
    }
};

// Pokretanje Kafka konzumer-a
(async () => {
    try {
        await consumer.connect();
        await consumer.subscribe({ topic: 'event-transaction', fromBeginning: false });

        // Postavi handler za svaku poruku
        await consumer.run({
            eachMessage: async ({ message }) => {
                await processKafkaMessage(message);
            },
        });

        console.log("Kafka consumer started successfully.");
    } catch (error) {
        console.error("Error starting Kafka consumer:", error);
    }
})();

// Rute
app.get('/', (req, res) => {
    const reversedMessages = messages.slice().reverse();
    res.render('index', { messages: reversedMessages });
});

app.post('/clear', (req, res) => {
    messages = [];
    masterCount = 0;
    dinaCount = 0;
    visaCount = 0;
    res.status(200).json({ message: 'Messages cleared successfully.' });
});


// Pokretanje servera
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
