const express = require('express');
const cors = require('cors');
const http = require('http');
const socketConfig = require('./config/socketConfig');
const routes = require('./routes');
const { ExpressPeerServer } = require("peer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 9000;
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
routes(app);

const io = require('socket.io')(server, socketConfig);
require('./controllers/socketController')(io);

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: "/myapp",
});

app.use('/peerjs', peerServer);
app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});