const express = require('express');
const cors = require('cors');
const https = require('https');
const socketConfig = require('./config/socketConfig');
const routes = require('./routes');
const { ExpressPeerServer } = require("peer");
const path = require('path');

const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 9000;

let options = {
  key: fs.readFileSync("../../../etc/letsencrypt/live/axtell.iat.sfu.ca/privkey.pem"),
  cert: fs.readFileSync("../../../etc/letsencrypt/live/axtell.iat.sfu.ca/fullchain.pem"),
  rejectUnauthorized: false
}

var server = https.createServer(options, app)

app.use(cors());
app.use(express.json());
routes(app);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


const io = require('socket.io')(server, socketConfig);
require('./controllers/socketController')(io);

const peerServer = ExpressPeerServer(server, {
  proxied: true,
  debug: true,
  path: "/myapp",
});

app.use(peerServer);
app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});