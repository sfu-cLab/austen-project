const express = require('express');
const cors = require('cors');
const https = require('https');
const socketConfig = require('./config/socketConfig');
const routes = require('./routes');
const { ExpressPeerServer } = require("peer");
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const token = process.env.DISCORD_BOT_TOKEN;

const USER_ID_1 = '1217803633580576878';
const USER_ID_2 = '1040442081459589130';
const USER_ID_3 = '723677031442677811';
const USER_ID_4 = '';
const USER_ID_5 = '';
const USER_ID_6 = '';

const VOICE_CHANNEL_ID_1 = '1217794085755289661';
const VOICE_CHANNEL_ID_2 = '1217794115035463750';
const VOICE_CHANNEL_ID_3 = '1217794115035463750';

const emojiToUserIdMap = {
  "📘": USER_ID_1,
  "🦆": USER_ID_2,
  "🌼": USER_ID_3,
};

let callsData = JSON.parse(fs.readFileSync('src/calls.json', 'utf-8'));
const startTime = new Date().getTime();
const durationMinutes = 1;

const schedule = [
    { time: 5000, caller: USER_ID_1, callee: USER_ID_3, channel: VOICE_CHANNEL_ID_1 },
    { time: 10000, caller: USER_ID_1, callee: USER_ID_3, channel: VOICE_CHANNEL_ID_2 },
    // Add more scheduled calls as needed
];

client.once('ready', () => {
    console.log('Bot is ready.');

    schedule.forEach(call => {
        setTimeout(() => {
            moveUsers(call.caller, call.callee, call.channel);
        }, call.time);
    });
});

async function moveUsers(callerId, calleeId, channelId) {
    const guild = client.guilds.cache.first();
    const channel = await guild.channels.fetch(channelId);
    
    [callerId, calleeId].forEach(async userId => {
        const member = await guild.members.fetch(userId);
        if (member && member.voice.channelId !== channelId) {
            member.voice.setChannel(channel)
                .then(() => console.log(`Moved ${member.user.username} to ${channel.name}.`))
                .catch(console.error);
              
            if (member.voice.serverMute) {
                await member.voice.setMute(false);
                console.log(`Unmuted ${member.user.username}.`);
            }
        }
    });
}

client.login(token);










const app = express();
const PORT = 443;

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