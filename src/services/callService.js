const fsUtils = require('../utils/fsUtils');
const callsFilePath = 'src/calls.json';

async function addCall(id1, id2, timeslot) {
    let calls = await fsUtils.readJsonFile(callsFilePath);
    if (!calls[timeslot]) {
        calls[timeslot] = [];
    }
    if (calls[timeslot].length < 6) {
        calls[timeslot].push({ id1, id2 });
        await fsUtils.writeJsonFile(callsFilePath, calls);
    }
}

async function getCalls() {
    return await fsUtils.readJsonFile(callsFilePath);
}

module.exports = {
    addCall,
    getCalls,
};
