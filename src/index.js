const express = require('express');
const { ExpressPeerServer } = require('peer');
require('dotenv').config();

const app = express();
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT);

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use('/peerjs', peerServer);

console.log(`PeerJS server is running on port ${PORT}`);