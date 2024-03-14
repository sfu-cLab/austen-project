const express = require('express');
const cors = require('cors');
const https = require('https');
const socketConfig = require('./config/socketConfig');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// discord setup and logic
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

const emojiToUserIdMap = {
    "📘": USER_ID_1,
    "🦆": USER_ID_2,
    "🌼": USER_ID_3,
};

const timeslotsData = JSON.parse(fs.readFileSync('src/timeslots.json', 'utf-8'));
  
const VOICE_CHANNEL_ID_1 = '1217794085755289661';
const VOICE_CHANNEL_ID_2 = '1217794115035463750';
const VOICE_CHANNEL_ID_3 = '1217794115035463750';

const startTime = new Date();

client.once('ready', () => {
    console.log('Bot is ready.');
    monitorTimeslots();
});

function monitorTimeslots() {
    const now = new Date();
    console.log(now.getHours(), now.getMinutes());
    console.log(`Checking timeslots at ${now.toISOString()}`);
    timeslotsData.timeslots.forEach(timeslot => {

        const [startHours, startMinutes] = timeslot.start.split(':').map(Number);
        startTime.setHours(startHours, startMinutes, 0, 0);

        const endTime = new Date(startTime);
        const [endHours, endMinutes] = timeslot.end.split(':').map(Number);
        endTime.setHours(endHours, endMinutes, 0, 0);

        if (now >= startTime && now < endTime) {
            let callsData = JSON.parse(fs.readFileSync('src/calls.json', 'utf-8'));
            const currentCalls = callsData[timeslot.timeslot];

            console.log(`Current timeslot: ${timeslot.timeslot} - setting up calls: ${currentCalls}`);

            var callCount = 0;

            currentCalls.forEach(call => {
                const callerId = emojiToUserIdMap[call.callerEmoji];
                const calleeId = emojiToUserIdMap[call.calleeEmoji];

                if (callCount == 0) {
                    moveUsers(callerId, calleeId, VOICE_CHANNEL_ID_1);
                }
                else if (callCount == 1) {
                    moveUsers(callerId, calleeId, VOICE_CHANNEL_ID_2);
                }
                else if (callCount == 2) {
                    moveUsers(callerId, calleeId, VOICE_CHANNEL_ID_3);
                }

                callCount++;
            });
        }
    });
    setTimeout(monitorTimeslots, 5000);
}

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

// server setup - express, sockets, certs
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

app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});