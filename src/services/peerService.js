const callService = require('./callService');

function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

async function checkTimeslots() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const data = await callService.getScheduledCalls();
    const timeslots = JSON.parse(data);
    timeslots.timeslots.forEach(slot => {
        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            console.log(`Timeslot ${slot.timeslot} is active`);
        }
    });



}

module.exports = {
    checkTimeslots,
};
