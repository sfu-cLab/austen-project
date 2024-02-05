const fsUtils = require('../utils/fsUtils');
const callsFilePath = 'src/calls.json';

async function addCall(id1, id2, timeslot) {
    let calls = await fsUtils.readJsonFile(callsFilePath);
    if (!calls[timeslot]) {
        calls[timeslot] = [];
    }
    if ((id1 != id2) && !calls[timeslot].find(call => (call.id1 === id1 && call.id2 === id2) || (call.id1 === id2 && call.id2 === id1))) {
        calls[timeslot].push({ id1, id2 });
        await fsUtils.writeJsonFile(callsFilePath, calls);
        console.log('Call added successfully between ' + id1 + id2 + 'at timeslot: ' + timeslot);
    }
    else {
        console.log('Call not added - timeslot is full or call already exists');
    }
}

async function getCalls() {
    return await fsUtils.readJsonFile(callsFilePath);
}

module.exports = {
    addCall,
    getCalls,
};
