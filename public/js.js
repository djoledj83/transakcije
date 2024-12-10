const socket = io();

// Function to parse backend message
const parseMessage = (msg) => {
    const { key, message } = msg || {};  // Ako 'msg' nije prisutan, vrati prazan objekat
    if (!message) return {};  // Ako 'message' nije prisutno, vrati prazan objekat

    const { level, source, message: text, properties } = message;
    return {
        key,
        level: level || 'Unknown',
        source: source || 'Unknown',
        text: text || 'No message text',
        image: properties?.screenCapture || null
    };
};

// Function to update the message list in the DOM
const updateMessageList = (parsedMsg) => {
    const { key, level, source, text, image } = parsedMsg;

    // Get the message list element
    const messageList = document.getElementById("accordionExample");
    const listItem = document.createElement("div");
    listItem.className = "poruka";

    // Construct the message content using textContent for safety
    const keySpan = document.createElement("span");
    keySpan.className = "key";
    keySpan.textContent = `Tid: ${key}`;

    const levelSpan = document.createElement("span");
    levelSpan.className = "level";
    levelSpan.textContent = `LvL: ${level}`;

    const sourceSpan = document.createElement("span");
    sourceSpan.className = "source";
    sourceSpan.textContent = `Source: ${source}`;

    const messageSpan = document.createElement("span");
    messageSpan.className = "message";
    messageSpan.textContent = text;

    listItem.appendChild(keySpan);
    listItem.appendChild(levelSpan);
    listItem.appendChild(sourceSpan);
    listItem.appendChild(messageSpan);

    // Add image if available
    if (image) {
        const img = document.createElement("img");
        img.src = `data:image/png;base64,${image}`;
        img.alt = "Image";
        img.className = "image";
        listItem.appendChild(img);
    }

    // Add the new message to the top of the list
    messageList.prepend(listItem);
};

// Listen for 'message' events from the server
socket.on("message", (backend_msg) => {
    const parsedMsg = parseMessage(backend_msg);
    updateMessageList(parsedMsg);
    console.log("Received message:", parsedMsg);
});
