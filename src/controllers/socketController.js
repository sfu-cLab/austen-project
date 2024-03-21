const userService = require('../services/userService');
const callService = require('../services/callService');
const loggingService = require('../services/loggingService');

module.exports = function(io) {
    io.on('connection', async (socket) => {
        console.log('User connected with socket id: ' + socket.id);
        const users = await userService.getUsers();
        const currentCalls = await callService.getCalls();
        io.emit('users', { users: users, calls: currentCalls });
        io.emit('newCall', currentCalls);
        
        socket.on('disconnect', async () => {
            const users = await userService.getUsers();
            console.log('DISCONNECT')
            // TODO: write to log
        });

        socket.on('toggleFan', async (emoji) => {
            console.log('Toggling fan')
            await userService.toggleUserAvailability(emoji);
            const users = await userService.getUsers();
            const calls = await callService.getCalls();
            io.emit('users', { users: users, calls: calls });
        });

        socket.on('callUser', async (data) => {
            await callService.addCall(data.callerEmoji, data.calleeEmoji, data.timeslot);
            const currentCalls = await callService.getCalls();
            io.emit('newCall', currentCalls);
            await loggingService.insertRow([new Date().toISOString(), data.callerEmoji, data.calleeEmoji, data.timeslot]);
        });

        socket.on('userSignedIn', async (selectedEmoji) => {
            await userService.updateUserSignedInStatus(selectedEmoji, true);
            const users = await userService.getUsers();
            io.emit('users', { users: users });
        });
    });
};
