const express = require('express');
const cors = require('cors');
const https = require('https');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const eventEmitter = require('./utils/eventEmitter');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const token = process.env.DISCORD_BOT_TOKEN;

const USER_ID_1 = process.env.USER_ID_1;
const USER_ID_2 = process.env.USER_ID_2;
const USER_ID_3 = process.env.USER_ID_3;
const USER_ID_4 = process.env.USER_ID_4;
const USER_ID_5 = process.env.USER_ID_5;
const USER_ID_6 = process.env.USER_ID_6;

const emojiToUserIdMap = {
    "🌼": USER_ID_1,
    "🦆": USER_ID_2,
    "📘": USER_ID_3,
    "🌲": USER_ID_4,
    "🌰": USER_ID_5,
};

const timeslotsData = JSON.parse(fs.readFileSync('src/timeslots.json', 'utf-8'));

const LOBBY_CHANNEL_ID = process.env.LOBBY_CHANNEL_ID;
const VOICE_CHANNEL_ID_1 = process.env.VOICE_CHANNEL_ID_1;
const VOICE_CHANNEL_ID_2 = process.env.VOICE_CHANNEL_ID_2;
const VOICE_CHANNEL_ID_3 = process.env.VOICE_CHANNEL_ID_3;

const startTime = new Date();

client.once('ready', () => {
    console.log('Bot is ready.');
    monitorTimeslots();
});

let activeCalls = new Map();

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
            let usersData = JSON.parse(fs.readFileSync('src/users.json', 'utf-8'));
            const currentCalls = callsData[timeslot.timeslot];

            console.log(`Current timeslot: ${timeslot.timeslot} - setting up calls: ${JSON.stringify(currentCalls)}`);

            currentCalls.forEach((call, index) => {
                const callIdentifier = `${timeslot.timeslot}-${index}`;

                if (!activeCalls.has(callIdentifier)) {
                    const callerId = emojiToUserIdMap[call.callerEmoji];
                    const calleeId = emojiToUserIdMap[call.calleeEmoji];
                    let isCalleeAvailable = usersData.find(user => call.callerEmoji === user.emoji).isAvailable;
                    let isCallerAvailable = usersData.find(user => call.calleeEmoji === user.emoji).isAvailable;

                    if (isCalleeAvailable && isCallerAvailable) {
                        let channelId;
                        if (index === 0) channelId = VOICE_CHANNEL_ID_1;
                        else if (index === 1) channelId = VOICE_CHANNEL_ID_2;
                        else if (index === 2) channelId = VOICE_CHANNEL_ID_3;

                        moveUsers(callerId, calleeId, channelId, timeslot.timeslot);
                    } else {
                        console.log('User is not available, call cancelled');
                        let reason = '';
                        if (!isCalleeAvailable && !isCallerAvailable) {
                            reason = `${call.callerEmoji} and ${call.calleeEmoji} both have their fans closed`;
                        }
                        else if (!isCalleeAvailable) {
                            reason = `${call.calleeEmoji} has their fan closed`;
                        }
                        else if (!isCallerAvailable) {
                            reason = `${call.callerEmoji} has their fan closed`;
                        }
                        eventEmitter.emit('log', [new Date().toISOString(), 'User is not available, call cancelled, reason: ', reason]);
                    }

                    const duration = endTime.getTime() - now.getTime();
                    setTimeout(() => {
                        moveUsersOut(callerId, calleeId, LOBBY_CHANNEL_ID);
                        eventEmitter.emit('log', [new Date().toISOString(), 'Ending call between ', call.callerEmoji + ' and ' + call.calleeEmoji + ' at timeslot ' + timeslot.timeslot]);
                        activeCalls.delete(callIdentifier);
                    }, duration);

                    activeCalls.set(callIdentifier, true);
                }
            });
        }
    });
    setTimeout(monitorTimeslots, 1000);
}


async function moveUsers(callerId, calleeId, channelId, timeslot) {
    const userIds = [callerId, calleeId];
    const guild = client.guilds.cache.first();
    const channel = await guild.channels.fetch(channelId);
    let usersInCall = [];
    
    for (const userId of userIds) {
        const member = await guild.members.fetch(userId);
        if (member && member.voice.channelId !== channelId) {
            await member.voice.setChannel(channel)
                .then(() => console.log(`Moved ${member.user.username} to ${channel.name}`))
                .catch(console.error);
              
            if (member.voice.serverMute) {
                await member.voice.setMute(false);
                console.log(`Unmuted ${member.user.username}.`);
            }
            usersInCall.push(member.user.username);
        }
    };
    
    if (usersInCall.length > 1) {
        callerUsername = usersInCall[0];
        calleeUsername = usersInCall[1];
        callerEmoji = Object.keys(emojiToUserIdMap).find(key => emojiToUserIdMap[key] === callerId);
        calleeEmoji = Object.keys(emojiToUserIdMap).find(key => emojiToUserIdMap[key] === calleeId);
        eventEmitter.emit('log', [new Date().toISOString(), 'Starting call between ', callerEmoji + ' and ' + calleeEmoji + ' at timeslot ' + timeslot]);
    }
}

async function moveUsersOut(callerId, calleeId, lobbyChannelId) {
    const guild = client.guilds.cache.first();
    const lobbyChannel = await guild.channels.fetch(lobbyChannelId);
    let usersMoved = [];

    const userIds = [callerId, calleeId];

    await Promise.all(userIds.map(async (userId) => {
        try {
            const member = await guild.members.fetch(userId);
            if ([VOICE_CHANNEL_ID_1, VOICE_CHANNEL_ID_2, VOICE_CHANNEL_ID_3].includes(member.voice.channelId)) {
               
                usersMoved.push(member.user.username);
                console.log(`Moved ${member.user.username} back to the lobby.`);
                await member.voice.setChannel(lobbyChannel);
                await member.voice.setMute(true);
            }
        } catch (error) {
            console.error(`Error moving user ${userId} back to the lobby:`, error);
        }
    }));

    // eventEmitter.emit('log', [new Date().toISOString(), 'Ending call between ', usersMoved[0] + ' and ' + usersMoved[1]]);
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

const io = require('socket.io')(server);
require('./controllers/socketController')(io);

app.use(express.static(path.join(__dirname)));

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});