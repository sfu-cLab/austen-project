const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/peerjs'
});

app.use('/peerjs', peerServer);