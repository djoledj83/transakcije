const socket = io();

// Listen for 'message' events from the server
socket.on("message", (msg) => {
    const messageList = document.getElementById("accordionExample");
    const listItem = document.createElement("div");
    listItem.className = "poruka";

    const keySpan = document.createElement("span");
    keySpan.className = "key";
    keySpan.textContent = `Tid: ${msg.TID}`;

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

    // Dynamically set the class based on msg.Brand
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

    // Set the text content
    brandSpan.textContent = `BIN: ${msg.Banka}`;

    const hostResponseSpan = document.createElement("span");
    hostResponseSpan.className = "message";
    hostResponseSpan.textContent = `Host resp: ${msg.HostResponse}`;

    const terminalResponseSpan = document.createElement("span");
    terminalResponseSpan.className = "message";
    terminalResponseSpan.textContent = `Terminal resp: ${msg.TerminalResponse}`;

    const dinaCounter = document.createElement("span");
    dinaCounter.className = "message";
    dinaCounter.textContent = `DinaCount: ${msg.DinaCount}`;

    const masteCounter = document.createElement("span");
    masteCounter.className = "message";
    masteCounter.textContent = `MasterCount: ${msg.MasterCount}`;

    const visaCounter = document.createElement("span");
    visaCounter.className = "message";
    visaCounter.textContent = `VisaCount: ${msg.VisaCount}`;

    listItem.appendChild(keySpan);
    listItem.appendChild(levelSpan);
    listItem.appendChild(binSpan);
    listItem.appendChild(statusSpan);
    listItem.appendChild(brandSpan);
    listItem.appendChild(hostResponseSpan);
    listItem.appendChild(terminalResponseSpan);

    // Prepend the new message to the top of the list
    messageList.prepend(listItem);
});
