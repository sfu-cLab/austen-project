require('dotenv').config();

import express from 'express';
const { ExpressPeerServer } = require('peer');

const app = express();
const PORT: number | string = process.env.PORT || 3000;

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello World with TypeScript!');
});

const server = app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use('/peerjs', peerServer);