const fs = require('fs');
const path = require('path');
const eventEmitter = require('../utils/eventEmitter');

eventEmitter.on('log', (data) => {
    console.log('Log event emitted');
    try {
        insertRow(data);
    }
    catch (err) {
        console.error('Error in log event:', err);
    }
});

function insertRow(data) {
    try {
        const csvFile = path.join(path.resolve(__dirname, '..'), 'logs.csv');
        const dataStr = data.join(',') + '\n';
        fs.appendFileSync(csvFile, dataStr);
    } catch (err) {
        console.error('Error in insertRow:', err);
    }
}
module.exports = {
    insertRow,
};