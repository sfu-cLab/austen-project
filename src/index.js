const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9000;

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ["http://localhost:5500", "https://clabdancecard.github.io", "https://peerjsserver-jc6u.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

let availableEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🐻', '🦋', '🐧'];
let userEmojis = {};

let schedule = new Array(8).fill(null).map(() => ({id1: null, id2: null}));

async function updateUserAvailability(userName, isAvailable) {
    try {
        const data = await fs.readFile('./users.json', 'utf8');
        let users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.name === userName);
        if (userIndex === -1) {
            console.log('User not found');
            return;
        }
        users[userIndex].isAvailable = isAvailable;
        await fs.writeFile('./users.json', JSON.stringify(users));
        console.log('User availability updated for ' + userName + ' to ' + isAvailable);
    }
    catch (err) {
        console.log('Error updating user availability: ', err);
    }
}

function scheduleCall(slot, id1, id2) {
    if (slot < 0 || slot > 7) {
        console.log("Invalid slot");
        return;
    }
    schedule[slot] = {id1, id2};
    console.log('All scheduled calls:' + JSON.stringify(schedule));
}

function assignEmoji() {
    if (availableEmojis.length > 0) {
        return availableEmojis.pop();
    } else {
        console.log("No more emojis available");
        return null;
    }
}

function handleDisconnect(socket) {
    if (userEmojis[socket.id]) {
        availableEmojis.push(userEmojis[socket.id]);
        console.log(`Emoji ${userEmojis[socket.id]} released from user ${socket.id}`);
        delete userEmojis[socket.id];
    }
    socket.emit('onlineUsers', userEmojis);
}

io.on('connection', (socket) => {
    const assignedEmoji = assignEmoji();
    if (assignedEmoji) {
        userEmojis[socket.id] = assignedEmoji;
        console.log(`Emoji ${assignedEmoji} assigned to user ${socket.id}`);
        socket.emit('assignEmoji', assignedEmoji);
    } else {
        socket.emit('noEmojiAvailable');
    }

    socket.on('clientDisconnecting', () => {
        handleDisconnect(socket);
    });

    socket.on('disconnect', () => {
        handleDisconnect(socket);
    });

    socket.on('emojiClicked', (data) => {
        console.log(data);
        scheduleCall(data.slot, data.callSenderEmoji, data.callReceiverEmoji);
        io.emit('newCallScheduled', data);
    });
    
    io.emit('onlineUsers', userEmojis);
});

const path = require("path");
const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
  ssl: {},
});

app.use(peerServer);

app.use(express.static(path.join(__dirname)));


server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
