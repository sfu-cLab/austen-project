const { Observable } = require('rxjs');
const callService = require('./callService');
const utils = require('../utils/utils');

function checkTimeslotsObservable() {
    return new Observable(subscriber => {
        let lastTimeslot = null;
        const intervalId = setInterval(async () => {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const data = await callService.getScheduledCalls();
            const timeslots = JSON.parse(data);

            let currentTimeslot = null;
            timeslots.timeslots.forEach(slot => {
                const startMinutes = utils.timeToMinutes(slot.start);
                const endMinutes = utils.timeToMinutes(slot.end);
                if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                    currentTimeslot = slot;
                }
            });
            
            if (currentTimeslot && (lastTimeslot && currentTimeslot.timeslot !== lastTimeslot.timeslot || !lastTimeslot)) {
                console.log('Timeslot changed:', currentTimeslot);
                lastTimeslot = currentTimeslot;
                subscriber.next(currentTimeslot);
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
        };
    });
}

module.exports = {
    checkTimeslotsObservable
};