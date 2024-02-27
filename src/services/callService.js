const fsUtils = require('../utils/fsUtils');
const callsFilePath = 'src/calls.json';
const timeslotPath = 'src/timeslots.json';

async function addCall(callerEmoji, calleeEmoji, timeslot) {
    let calls = await fsUtils.readJsonFile(callsFilePath);
    if (!calls[timeslot]) {
        calls[timeslot] = [];
    }
    if (callerEmoji !== calleeEmoji && !calls[timeslot].find(call => (call.callerEmoji === callerEmoji && call.calleeEmoji === calleeEmoji) || (call.callerEmoji === calleeEmoji && call.calleeEmoji === callerEmoji))) {
        calls[timeslot].push({ callerEmoji, calleeEmoji });
        await fsUtils.writeJsonFile(callsFilePath, calls);
        console.log(`Call added successfully between ${callerEmoji} and ${calleeEmoji} at timeslot: ${timeslot}`);
    }
    else {
        console.log('Call not added - timeslot is full or call already exists');
    }
}

async function getCalls() {
    return await fsUtils.readJsonFile(callsFilePath);
}

async function getScheduledCalls() {
    let timeslots = await fsUtils.readJsonFile(timeslotPath);
    return JSON.stringify(timeslots);
}

module.exports = {
    addCall,
    getCalls,
    getScheduledCalls,
};
