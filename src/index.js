const express = require('express');
const cors = require('cors');
const { ExpressPeerServer } = require('peer');

const app = express();
app.use(cors())
app.use(express.json());

const PORT = process.env.PORT || 9000;

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

let waitingUsers = [];

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'
});

app.post('/addUserToWaitingList', (req, res) => {
  waitingUsers.push(req.body.peerId); 
  res.json({ message: `User id ${req.body.peerId} added to waiting list` }); 
  console.log(waitingUsers);
});

app.use('/peerjs', peerServer);