const userService = require('../services/userService');
const callService = require('../services/callService');
const eventEmitter = require('../utils/eventEmitter');
require('../services/loggingService');

let emojisToSocketIds = {};

module.exports = function(io) {
    io.on('connection', async (socket) => {
        console.log('User connected with socket id: ' + socket.id);
        const users = await userService.getUsers();
        const currentCalls = await callService.getCalls();
        io.emit('users', { users: users, calls: currentCalls });
        io.emit('newCall', currentCalls);

        socket.on('toggleFan', async (emoji) => {
            console.log('Toggling fan');
            await userService.toggleUserAvailability(emoji);
            const users = await userService.getUsers();
            const calls = await callService.getCalls();
            io.emit('users', { users: users, calls: calls });
            var message = users.find(user => user.emoji === emoji).isAvailable ? 'Opened fan' : 'Closed fan';
            eventEmitter.emit('log', [new Date().toISOString(), emoji, message]);
        });

        socket.on('callUser', async (data) => {
            await callService.addCall(data.callerEmoji, data.calleeEmoji, data.timeslot);
            const currentCalls = await callService.getCalls();
            io.emit('newCall', currentCalls);
            eventEmitter.emit('log', [new Date().toISOString(), 'Call initiated by ' + data.callerEmoji + ' to ' + data.calleeEmoji + ' at timeslot ' + data.timeslot]);
        });

        socket.on('userSignedIn', async (selectedEmoji) => {
            console.log('User signed in with emoji: ' + selectedEmoji);
            // TODO: add to voice lobby
            await userService.updateUserSignedInStatus(selectedEmoji, true);
            const users = await userService.getUsers();
            emojisToSocketIds[selectedEmoji] = socket.id;
            io.emit('users', { users: users });
        });

        socket.on('disconnect', async () => {
            const users = await userService.getUsers();
            io.emit('users', { users: users });
            let emoji = Object.keys(emojisToSocketIds).find(key => emojisToSocketIds[key] === socket.id);
            eventEmitter.emit('log', [new Date().toISOString(), emoji, 'User disconnected']);
            await userService.updateUserSignedInStatus(emoji, false);
            console.log('User disconnected with emoji: ' + emoji);
        });
    });
};
