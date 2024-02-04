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
        await fs.writeFile('src/users.json', JSON.stringify(users, null, 2));
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
        await fs.writeFile('src/users.json', JSON.stringify(users, null, 2));
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

function handleDisconnect(socket) {
    if (userEmojis[socket.id]) {
        availableEmojis.push(userEmojis[socket.id]);
        console.log(`Emoji ${userEmojis[socket.id]} released from user ${socket.id}`);
        delete userEmojis[socket.id];
    }
    socket.emit('onlineUsers', userEmojis);
}

async function addCall(id1, id2, timeslot) {
    try {
        const data = await fs.readFile('src/calls.json', 'utf8');
        let calls = JSON.parse(data);

        if (!calls[timeslot]) {
            calls[timeslot] = [];
        }

        if (calls[timeslot].length < 6 && !calls[timeslot].find(call => (call.id1 === id1 && call.id2 === id2) || (call.id1 === id2 && call.id2 === id1))){
            calls[timeslot].push({ id1, id2 });
            await fs.writeFile('src/calls.json', JSON.stringify(calls, null, 2));
            console.log(`Call scheduled in timeslot ${timeslot}.`);
        } else {
            console.log(`Cannot schedule call in timeslot ${timeslot}, limit reached or call already exists.`);
        }
    } catch (err) {
        console.error('Error adding call: ', err);
    }
}

async function getCalls() {
    try {
        const data = await fs.readFile('src/calls.json', 'utf8');
        return JSON.parse(data);
    }
    catch (err) {
        console.log('Error getting calls: ', err);
    }
}

io.on('connection', async (socket) => {
    try {
        let users = await getUsers();

        socket.on('clientDisconnecting', () => {
            handleDisconnect(socket);
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
        });

        socket.on('callUser', async (data) => {
            console.log('callerId: ', data.callerId);
            console.log('idToCall: ', data.idToCall);
            console.log('timeslot: ', data.timeslot);
            await addCall(data.callerId, data.idToCall, data.timeslot);
            let currentcalls = await getCalls();
            io.emit('newCall', currentcalls);
        });


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
