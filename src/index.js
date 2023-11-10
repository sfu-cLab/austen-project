const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = require('http').createServer(app);
const PORT = process.env.PORT || 9000;

// PeerJS server
const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/myapp'
});

app.use('/peerjs', peerServer);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
