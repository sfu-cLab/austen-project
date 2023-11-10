const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = app.listen(process.env.PORT || 9000);
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

let waitingUsers = [];

peerServer.on('connection', (client) => {
  console.log(`User connected with ID: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`User disconnected with ID: ${client.getId()}`);
  waitingUsers = waitingUsers.filter(peerId => peerId !== client.getId());
});

app.get('/pair', (req, res) => {
  if (waitingUsers.length > 0) {
    const peerId = waitingUsers.shift(); // Get the first waiting user
    res.json({ peerId });
  } else {
    res.status(404).json({ message: 'No peers waiting' });
  }
});

app.post('/wait', (req, res) => {
  const { peerId } = req.body;
  if (!waitingUsers.includes(peerId)) {
    waitingUsers.push(peerId); // Add new user to the waiting list
    console.log(`User with ID ${peerId} added to waiting list`);
  }
  res.status(200).json({ message: 'Added to waiting list' });
});

console.log(`Server is running on port ${process.env.PORT || 9000}`);
