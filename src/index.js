const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs').promises;
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function iterateWithDelays(times, delayDuration) {
    for (let i = 1; i <= times; i++) {
        console.log(`Iteration ${i} at ${new Date().toLocaleTimeString()}`);
        await delay(delayDuration);
    }
}
iterateWithDelays(8, 15 * 60);

let userEmojis = {};

let schedule = new Array(8).fill(null).map(() => ({id1: null, id2: null}));

async function toggleUserAvailability(emoji) {
    try {
        const data = await fs.readFile('src/users.json', 'utf8');
        let users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.emoji === emoji);
        if (userIndex === -1) {
            console.log('User not found');
            return;
        }
        users[userIndex].isAvailable = !users[userIndex].isAvailable;
        await fs.writeFile('src/users.json', JSON.stringify(users));
        console.log('User availability updated for ' + emoji + ' to ' + users[userIndex].isAvailable);
    }
    catch (err) {
        console.log('Error updating user availability: ', err);
    }
}

async function updateUserSignedInStatus(emoji, isSignedIn) {
    try {
        const data = await fs.readFile('src/users.json', 'utf8');
        let users = JSON.parse(data);
        const userIndex = users.findIndex(user => user.emoji === emoji);
        if (userIndex === -1) {
            console.log('User not found');
            return;
        }
        users[userIndex].isSignedIn = isSignedIn;
        await fs.writeFile('src/users.json', JSON.stringify(users));
        console.log('User signed in status updated for ' + emoji + ' to ' + isSignedIn);
    }
    catch (err) {
        console.log('Error updating user signed in status: ', err);
    }
}

async function getUsers() {
    try {
        const data = await fs.readFile('src/users.json', 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.log('Error getting users: ', err);
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

function handleDisconnect(socket) {
    if (userEmojis[socket.id]) {
        availableEmojis.push(userEmojis[socket.id]);
        console.log(`Emoji ${userEmojis[socket.id]} released from user ${socket.id}`);
        delete userEmojis[socket.id];
    }
    socket.emit('onlineUsers', userEmojis);
}

io.on('connection', async (socket) => {
    try {
        let users = await getUsers();

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

        socket.on('hideFan', async (emoji) => {
            await toggleUserAvailability(emoji);
            let updatedUsers = await getUsers();
            console.log('Updated users: ', updatedUsers);
            io.emit('users', updatedUsers);
        });

        io.emit('users', users);
        
        io.emit('onlineUsers', users);

        socket.on('userSignedIn', (emoji) => {
            console.log(emoji + ' signed in');
            updateUserSignedInStatus(emoji, true);
            io.emit('onlineUsers', users);
        }
        );
    } catch (err) {
        console.error('Error in connection handler:', err);
    }
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
