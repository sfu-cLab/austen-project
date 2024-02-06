const userService = require('../services/userService');
const callService = require('../services/callService');

module.exports = function(io) {
    io.on('connection', async (socket) => {
        console.log('A user connected: ', socket.id); // TODO log user emoji because socket.id is different each time

        try {
            let users = await userService.getUsers();
            let currentCalls = await callService.getCalls();
            io.emit('users', { users: users, calls: currentCalls });
            io.emit('newCall', currentCalls);

            socket.on('clientDisconnecting', () => {
                console.log('A user disconnected');
            });

            socket.on('hideFan', async (emoji) => {
                await userService.toggleUserAvailability(emoji);
                let updatedUsers = await userService.getUsers();
                let currentCalls = await callService.getCalls();
                io.emit('users', { users: updatedUsers, calls: currentCalls });
            });

            socket.on('userSignedIn', async (emoji) => {
                await userService.updateUserSignedInStatus(emoji, true);
                let updatedUsers = await userService.getUsers();
                io.emit('onlineUsers', updatedUsers);
            });

            socket.on('callUser', async (data) => {
                await callService.addCall(data.callerId, data.idToCall, data.timeslot);
                currentCalls = await callService.getCalls();
                io.emit('newCall', currentCalls);
            });
        } catch (err) {
            console.error('Error in connection handler:', err);
        }
    });
};
