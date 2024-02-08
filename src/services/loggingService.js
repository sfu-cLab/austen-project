const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

async function insertRow(data) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: 'Sheet1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [data],
            },
        });
        
    } catch (err) {
        console.error('Error in insertRow:', err);
    }
}

module.exports = {
    insertRow,
};