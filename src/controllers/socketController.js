const userService = require('../services/userService');
const callService = require('../services/callService');

module.exports = function(io) {
    io.on('connection', async (socket) => {
        console.log('A user connected');

        try {
            let users = await userService.getUsers();
            io.emit('users', users);

            socket.on('clientDisconnecting', () => {
                console.log('A user disconnected');
            });

            socket.on('hideFan', async (emoji) => {
                await userService.toggleUserAvailability(emoji);
                let updatedUsers = await userService.getUsers();
                console.log('Updated users: ', updatedUsers);
                io.emit('users', updatedUsers);
            });

            socket.on('userSignedIn', async (emoji) => {
                await userService.updateUserSignedInStatus(emoji, true);
                let updatedUsers = await userService.getUsers();
                io.emit('onlineUsers', updatedUsers);
            });

            socket.on('callUser', async (data) => {
                console.log(`callerId: ${data.callerId}, idToCall: ${data.idToCall}, timeslot: ${data.timeslot}`);
                await callService.addCall(data.callerId, data.idToCall, data.timeslot);
                let currentCalls = await callService.getCalls();
                io.emit('newCall', currentCalls);
            });
        } catch (err) {
            console.error('Error in connection handler:', err);
        }
    });
};
