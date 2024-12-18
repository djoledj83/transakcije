const socket = io();

let currentClass = "poruka"; // Početna klasa koja se primenjuje na nove poruke

// Listen for 'message' events from the server
socket.on("message", (msg) => {
    const messageList = document.getElementById("accordionExample");
    const listItem = document.createElement("div");

    // Postavi trenutnu klasu (poruka ili porukaDark) na novu poruku
    listItem.className = currentClass;

    const keySpan = document.createElement("span");
    keySpan.className = "key";
    keySpan.innerHTML = `Tid: ${msg.TID} <br> Time: ${msg.Vreme}`;

    // const timeSpan = document.createElement("span");
    // timeSpan.className = "key";
    // timeSpan.textContent = `Time: ${msg.Vreme}`;

    const levelSpan = document.createElement("span");
    levelSpan.className = "acq";
    levelSpan.textContent = `AcQ: ${msg.ACQ}`;

    const binSpan = document.createElement("span");
    binSpan.className = "bin";
    binSpan.textContent = `BIN: ${msg.BIN}`;

    const statusSpan = document.createElement("span");
    statusSpan.className = "status";
    statusSpan.textContent = `Status: ${msg.Status}`;

    const brandSpan = document.createElement("span");

    // Dinamički postavi klasu za brend
    switch (msg.Brand) {
        case "MASTERCARD":
            brandSpan.className = "master";
            break;
        case "VISA":
            brandSpan.className = "visa";
            break;
        case "DINACARD":
            brandSpan.className = "dina";
            break;
        default:
            brandSpan.className = "brand";
            break;
    }

    brandSpan.textContent = `BRAND: ${msg.Brand}`;

    const hostResponseSpan = document.createElement("span");
    hostResponseSpan.className = "message hr";
    hostResponseSpan.textContent = `HR: ${msg.HostResponse}`;

    const terminalResponseSpan = document.createElement("span");
    terminalResponseSpan.className = "message tr";
    terminalResponseSpan.textContent = `TR: ${msg.TerminalResponse}`;

    const bankaSpan = document.createElement("span");
    bankaSpan.className = "message banka";
    bankaSpan.textContent = `Banka: ${msg.Banka}`;

    const dinaCounter = document.createElement("span");
    dinaCounter.className = "message";
    dinaCounter.textContent = `DCount: ${msg.DinaCount}`;

    const masteCounter = document.createElement("span");
    masteCounter.className = "message";
    masteCounter.textContent = `MCount: ${msg.MasterCount}`;

    const visaCounter = document.createElement("span");
    visaCounter.className = "message";
    visaCounter.textContent = `VCount: ${msg.VisaCount}`;

    listItem.appendChild(keySpan);
    listItem.appendChild(levelSpan);
    listItem.appendChild(binSpan);
    listItem.appendChild(brandSpan);
    listItem.appendChild(hostResponseSpan);
    listItem.appendChild(terminalResponseSpan);
    listItem.appendChild(bankaSpan);
    // listItem.appendChild(timeSpan);
    // listItem.appendChild(dinaCounter);
    // listItem.appendChild(masteCounter);
    // listItem.appendChild(visaCounter);

    // Dodaj novu poruku na vrh liste
    messageList.prepend(listItem);
});


function startCountdown() {
    const contdown = document.getElementsByClassName('contdown')[0]; // Pristup prvom elementu sa klasom "contdown"
    const stoperica = document.createElement("div"); // Kreiranje novog <div> elementa
    stoperica.setAttribute("id", "timer"); // Dodela ID-a (opciono, za lakši pristup)
    contdown.appendChild(stoperica); // Dodavanje <div> u "contdown" element

    let counter = 60; // Početna vrednost odbrojavanja

    setInterval(() => {
        stoperica.textContent = counter; // Postavljanje trenutne vrednosti kao tekst u <div>

        // Odbrojavanje
        counter--;

        // Ako dostigne 0, resetuj na 60
        if (counter < 0) {
            counter = 60;
        }
    }, 1000); // Interval u milisekundama (1000ms = 1 sekunda)
}


startCountdown();

// Menjaj trenutnu klasu na svakih 10 sekundi
setInterval(() => {
    // Ako je trenutna klasa "poruka", promeni je na "porukaDark", i obrnuto
    currentClass = currentClass === "poruka" ? "porukaDark" : "poruka";
}, 60000); // Na svakih 10 sekundi


function clearMessages() {
    fetch('/clear', {
        method: 'POST'
    })
        .then(response => {
            if (response.ok) {
                window.location.reload(); // Reload the page
            } else {
                throw new Error('Failed to clear messages.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
