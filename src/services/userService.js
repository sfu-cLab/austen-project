const fsUtils = require('../utils/fsUtils');
const usersFilePath = 'src/users.json';

async function toggleUserAvailability(socketId) {
    const users = await fsUtils.readJsonFile(usersFilePath);
    try {
        const userIndex = users.findIndex(user => user.socketId === socketId);
        if (userIndex !== -1) {
            users[userIndex].isAvailable = !users[userIndex].isAvailable;
            await fsUtils.writeJsonFile(usersFilePath, users);
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function updateUserSignedInStatus(emoji, isSignedIn) {
    let users = await fsUtils.readJsonFile(usersFilePath);
    try {
        const userIndex = users.findIndex(user => user.emoji === emoji);
        if (userIndex !== -1) {
            users[userIndex].isSignedIn = isSignedIn;
            await fsUtils.writeJsonFile(usersFilePath, users);
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function getUsers() {
    return await fsUtils.readJsonFile(usersFilePath);
}

async function updatePeerId(emoji, peerId) {
    let users = await fsUtils.readJsonFile(usersFilePath);
    try {
        const userIndex = users.findIndex(user => user.emoji === emoji);
        if (userIndex !== -1) {
            users[userIndex].peerId = peerId;
            await fsUtils.writeJsonFile(usersFilePath, users);
        }
    }
    catch (error) {
        console.log(error);
    }
}

async function updateSocketId(emoji, socketId) {
    let users = await fsUtils.readJsonFile(usersFilePath);
    try {
        const userIndex = users.findIndex(user => user.emoji === emoji);
        if (userIndex !== -1) {
            users[userIndex].socketId = socketId;
            await fsUtils.writeJsonFile(usersFilePath, users);
        }
    }    
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    toggleUserAvailability,
    updateUserSignedInStatus,
    getUsers,
    updatePeerId,
    updateSocketId,
};
