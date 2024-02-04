const fsUtils = require('../utils/fsUtils');
const usersFilePath = 'src/users.json';

async function toggleUserAvailability(emoji) {
    let users = await fsUtils.readJsonFile(usersFilePath);
    const userIndex = users.findIndex(user => user.emoji === emoji);
    if (userIndex !== -1) {
        users[userIndex].isAvailable = !users[userIndex].isAvailable;
        await fsUtils.writeJsonFile(usersFilePath, users);
    }
}

async function updateUserSignedInStatus(emoji, isSignedIn) {
    let users = await fsUtils.readJsonFile(usersFilePath);
    const userIndex = users.findIndex(user => user.emoji === emoji);
    if (userIndex !== -1) {
        users[userIndex].isSignedIn = isSignedIn;
        await fsUtils.writeJsonFile(usersFilePath, users);
    }
}

async function getUsers() {
    return await fsUtils.readJsonFile(usersFilePath);
}

module.exports = {
    toggleUserAvailability,
    updateUserSignedInStatus,
    getUsers,
};
