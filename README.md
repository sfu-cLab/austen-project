# The Digital Jane Austen Project
Connections Lab (cLab) @ Simon Fraser University

![image](https://github.com/sfu-cLab/austen-project/assets/45186464/f5a1eb59-580f-4d7a-9a48-33207f76dea5)


# Usage
- Timeslots are defined in `src/timeslots.json`, they can be set automatically using `cd src; node timeslotGenerator`
- User  info (nickname, emoji representation, etc.) is set in `users.json` 
- Users must join voice-channel #lobby and ensure they are un-deafened 🎧, ensure that microphone/speakerphone permissions are allowed  
 ![image](https://github.com/sfu-cLab/austen-project/assets/45186464/9990bd06-a25f-4947-874a-dea6539f6eb9)
- Start server with `sudo ~/.nvm/versions/node/v20.11.1/bin/node src/index.js` (note: server must be stopped and restarted if any changes to users and/or timeslots are made)
- Logs are written to `logs.csv`



![image](https://github.com/sfu-cLab/austen-project/assets/45186464/ea383dc2-016c-48c0-9d6b-c9d602b72c13)
