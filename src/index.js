const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');
const http = require('http');
const socketIo = require('socket.io');

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

    io.emit('onlineUsers', userEmojis);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

app.use('/peerjs', peerServer);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
