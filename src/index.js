require('dotenv').config();

const express = require('express');
const { ExpressPeerServer } = require('peer');
const { createServer } = require('http');
const { Server: WebSocketServer } = require('ws');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Create a PeerJS server
const peerServer = ExpressPeerServer(httpServer, {
  // The debug property is not needed here if it's not part of the PeerJS options.
});
app.use('/peerjs', peerServer);

// Handle the root route
app.get('/', (req, res) => {
  res.send('Hello World with JavaScript!');
});

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server: httpServer });
let waitingUsers = [];

wss.on('connection', (ws) => {
  ws.on('message', (messageEvent) => {
    // Make sure to check the data type before converting
    const message = typeof messageEvent === 'string' ? messageEvent : messageEvent.toString();
    const { type, payload } = JSON.parse(message);

    if (type === 'user-ready') {
      const userId = payload;
      waitingUsers.push({ userId, ws });

      // Matchmaking logic
      if (waitingUsers.length >= 2) {
        const userIndex = waitingUsers.findIndex((u) => u.userId === userId);
        let pairIndex = Math.floor(Math.random() * waitingUsers.length);
        while (pairIndex === userIndex) {
          pairIndex = Math.floor(Math.random() * waitingUsers.length);
        }

        const pairedUser = waitingUsers[pairIndex];

        // Remove both users from the waiting list
        waitingUsers = waitingUsers.filter((u) => u.ws !== ws && u.ws !== pairedUser.ws);

        // Notify both users to connect to each other
        ws.send(JSON.stringify({ type: 'connect-to-peer', payload: pairedUser.userId }));
        pairedUser.ws.send(JSON.stringify({ type: 'connect-to-peer', payload: userId }));
      }
    }
  });

  ws.on('close', () => {
    // Remove the user from the waiting list if they disconnect
    waitingUsers = waitingUsers.filter((u) => u.ws !== ws);
  });
});
