const leftBar = document.getElementById("bar1");
const rightBar = document.getElementById("bar2");
const allSlices = document.querySelectorAll("*");
const welcomeElement = document.getElementById('welcomeText');
const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? "http://localhost:9000" : "https://axtell.iat.sfu.ca:9000";
var currentUserEmoji = null; 
var socket = io(apiUrl);

const clockHand = document.getElementById('clockHand');

function updateClock(fixedStartTime, durationSeconds) {
    const now = new Date();
    const fixedStartDateTime = new Date(fixedStartTime);
    const elapsedTimeInSeconds = (now - fixedStartDateTime) / 1000;
    
    const progressInCurrentCycle = (elapsedTimeInSeconds % durationSeconds) / durationSeconds;
    const degrees = progressInCurrentCycle * 180;

    clockHand.style.transform = `rotate(${degrees}deg)`;

    requestAnimationFrame(() => updateClock(fixedStartTime, durationSeconds));
}

var schedule;
var durationSeconds;
var startHours;
var startMinutes;
var fixedStartTime;

fetch(`${apiUrl}/api/schedule`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        schedule = data.timeslots;

        const differenceInSeconds = (start, end) => {
            [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);

            const startInSeconds = startHours * 3600 + startMinutes * 60;
            const endInSeconds = endHours * 3600 + endMinutes * 60;

            return endInSeconds - startInSeconds;
        };
        durationSeconds = differenceInSeconds(schedule[0].start, schedule[schedule.length - 1].end);
        fixedStartTime = new Date();
        fixedStartTime.setHours(startHours, startMinutes, 0, 0);        
        requestAnimationFrame(() => updateClock(fixedStartTime, durationSeconds));
        // document.getElementById('playAudio').disabled = false;
    })
    .catch(error => {
        console.error('Error fetching schedule:', error);
    });

const soundtracks = [
    './audio/soundtrack_1.mp3',
    './audio/soundtrack_2.mp3'
];

let currentAudio = null;

function playSoundtracks(durationSeconds) {
    console.log('durationSeconds:', durationSeconds);
    const intervalSeconds = durationSeconds / soundtracks.length;
    soundtracks.forEach((trackUrl, index) => {
        setTimeout(() => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            currentAudio = new Audio(trackUrl);
            currentAudio.play().then(() => {
                console.log(`Playing soundtrack ${index + 1}`);
            }).catch(error => console.error("Error playing audio:", error));
        }, intervalSeconds * 1000);
    });
}

const idMappings = {
    1: ['1-left-0', '1-left-1', '1-left-2', '1-left-3', '1-left-4', '1-left-5'],
    2: ['2-left-0', '2-left-1', '2-left-2', '2-left-3', '2-left-4', '2-left-5'],
    3: ['3-left-0', '3-left-1', '3-left-2', '3-left-3', '3-left-4', '3-left-5'],
    4: ['4-left-0', '4-left-1', '4-left-2', '4-left-3', '4-left-4', '4-left-5'],
    5: ['5-left-0', '5-left-1', '5-left-2', '5-left-3', '5-left-4', '5-left-5'],
    6: ['6-left-0', '6-left-1', '6-left-2', '6-left-3', '6-left-4', '6-left-5'],
    7: ['7-left-0', '7-left-1', '7-left-2', '7-left-3', '7-left-4', '7-left-5'],
    8: ['8-left-0', '8-left-1', '8-left-2', '8-left-3', '8-left-4', '8-left-5'],
};

// https://cestoliv.com/blog/how-to-count-emojis-with-javascript/ - not supported on Firefox
function visibleLength(str) {
    return [...new Intl.Segmenter().segment(str)].length
}

function initializeEmojis(numberOfContainers, numberOfEmojisPerContainer) {
    function createContainer(containerIndex) {
        const container = document.createElement('div');
        container.className = `container-${containerIndex} flex-container`;
    
        for (let i = 0; i < numberOfEmojisPerContainer; i++) {
            const emoji = document.createElement('div');
            emoji.className = 'emoji';
            emoji.id = `${containerIndex}-left-${i}`;
            container.appendChild(emoji);
        }
        return container;
    }
    
    const piechart = document.querySelector('.allLeftEmojis');
    
    for (let i = 1; i <= numberOfContainers; i++) {
        const container = createContainer(i);
        piechart.appendChild(container);
    }
}

initializeEmojis(8, 6);

function toggleModal(show) {
    const overlay = document.getElementById('userModalOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function populateModalWithUsers(users) {
    const form = document.getElementById('userForm');
    form.innerHTML = '';

    users.forEach(user => {
        const label = document.createElement('label');
        let innerHTML = '';

        if (user.isSignedIn) {
            innerHTML = `<input type="radio" name="user" value="${user.emoji}" disabled> ${user.emoji} ${user.name} (already signed in)`;
            label.style.color = 'grey';
        } else {
            innerHTML = `<input type="radio" name="user" value="${user.emoji}"> ${user.emoji} ${user.name}`;
        }

        label.innerHTML = innerHTML;
        form.appendChild(label);
        label.appendChild(document.createElement('br'));
    });
}

function populateWelcomeText() {
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText) {
        welcomeText.textContent = `Welcome, ${currentUserEmoji}`;
    }
}

function submitSelection() {
    const selectedEmoji = document.querySelector('input[name="user"]:checked').value;
    currentUserEmoji = selectedEmoji;
    
    localStorage.setItem('currentUserEmoji', selectedEmoji);
    socket.emit('userSignedIn', selectedEmoji);
    populateWelcomeText();
    toggleModal(false);
}

function toggleFan(element, classToCheck, displayStyleCheck, displayStyleSet) {
    if (element.classList.contains(classToCheck)) {
        element.style.display = (element.textContent.trim() !== '' && element.style.display === displayStyleCheck) ? displayStyleSet : displayStyleCheck;
    }
}

leftBar.addEventListener("click", function () {
    allSlices.forEach(function (slice) {
        if (slice.classList.contains("left-border")) {
            slice.style.border = slice.style.border === "none" ? "" : "none";
        } else if (slice.classList.contains("left")) {
            toggleFan(slice, "emoji", "none", "inline");
            if (!slice.classList.contains("emoji")) {
                slice.style.display = slice.style.display === "none" ? "" : "none";
            }
        }
    });
});

rightBar.addEventListener("click", function () {
    allSlices.forEach(function (slice) {
        if (slice.classList.contains("right-border")) {
            slice.style.border = slice.style.border === "none" ? "" : "none";
        } else if (slice.classList.contains("right")) {
            toggleFan(slice, "emoji", "none", "inline");
            if (!slice.classList.contains("emoji")) {
                slice.style.display = slice.style.display === "none" ? "" : "none";
            }
        }
    });
    socket.emit('toggleFan', currentUserEmoji);
});

function mapScheduleToElementIds(scheduleNumber) {
    return idMappings[scheduleNumber] || [];
}

function populateEmojis(users, calls) {
    const emojiElementIds = Object.values(idMappings).flat();
    emojiElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = '';
            element.style.display = 'none';
        }
    });

    users.forEach(user => {
        user.schedule.forEach(scheduleNumber => {
            const elementIds = mapScheduleToElementIds(scheduleNumber);
        
            const elementId = elementIds.find(id => {
                const element = document.getElementById(id);
                return element && !element.textContent.trim();
            });

            if (elementId) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.textContent = user.emoji;
                    element.style.display = '';   

                    if (user.isAvailable) {
                        element.style.filter = '';
                        element.style.opacity = '';
                    } else {
                        element.style.filter = 'grayscale(100%)';
                        element.style.opacity = '0.25';
                    }
                }
            }
        });
    });
    populateCalls(calls);
}

function populateRightEmojis() {
    const parent = document.querySelector('.allRightEmojis.right');
    const radius = 310;
    const centerX = 500;
    const centerY = 475;
    const startAngle = Math.PI / 2;
    const endAngle = 3 * Math.PI / 2;
    const totalEmojis = 8;

    for (let i = 0; i < totalEmojis; i++) {
        const angleIncrement = (endAngle - startAngle) / (totalEmojis - 1);
        const angle = startAngle + (angleIncrement * i);
        
        const posX = centerX - (radius * Math.cos(angle));
        const posY = centerY + radius * Math.sin(angle);

        const newDiv = document.createElement('div');
        newDiv.id = `${totalEmojis - i}-right`;
        newDiv.className = 'emoji';
        newDiv.textContent = '';
        newDiv.style.position = 'absolute';
        newDiv.style.left = `${posX - 15}px`;
        newDiv.style.top = `${posY - 15}px`;
        newDiv.style.visibility = 'hidden';

        for(let j = 0; j < 8; j++) {
            const leftEmoji = document.getElementById(`${totalEmojis - i}-left-${j}`);
            if (leftEmoji && leftEmoji.textContent.trim().includes(currentUserEmoji) && visibleLength(leftEmoji.textContent.trim()) > 1) {
                newDiv.textContent = leftEmoji.textContent.trim().replace(currentUserEmoji, '');
                newDiv.style.visibility = 'visible';
            }
        }

        parent.appendChild(newDiv);
    }
}

socket.on('users', function(data) {
    console.log('Received users:', data);
    const calls = data.calls;
    const receivedUsers = data.users;
    populateEmojis(receivedUsers, calls); 
    const savedEmoji = localStorage.getItem('currentUserEmoji');
    if (savedEmoji) {
        currentUserEmoji = savedEmoji;
        populateWelcomeText();
    }
    else {
        populateModalWithUsers(receivedUsers);
        toggleModal(true);
    }
});

function populateUserModal(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    
    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-option';
        userDiv.innerHTML = `${user.emoji} ${user.name}`;
        userDiv.onclick = function() {
            console.log(`User ${user.name} selected`);
            toggleUserModal(false);
        };
        userList.appendChild(userDiv);
    });
}

document.querySelectorAll('.emoji').forEach(emoji => {
    emoji.addEventListener('click', () => {
        const callerEmoji = currentUserEmoji;
        const calleeEmoji = emoji.textContent;
        const timeslot = emoji.id[0];
        console.log(callerEmoji + ' is calling ' + calleeEmoji + ' at timeslot ' + timeslot);
        socket.emit('callUser', { callerEmoji, calleeEmoji, timeslot });        
    });
});

socket.on('newCall', function(calls) {
    populateCalls(calls);
    populateRightEmojis();
});

function populateCalls(calls) {
    Object.keys(calls).forEach(timeslot => {
        calls[timeslot].forEach(item => {
            const elementIds = mapScheduleToElementIds(timeslot);
        elementIds.forEach(id => {
                const element = document.getElementById(id);
                if (element.textContent.trim() === item.calleeEmoji) {
                    element.textContent = item.callerEmoji + item.calleeEmoji;
                }
                if (element.textContent.trim() === item.callerEmoji) {
                    element.style.visibility = 'hidden';
                }
            });
        });
    });
}

// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Build_a_phone_with_peerjs
let conn;
let code;
/**
 * Instantiate a new Peer, passing to it an alphanumeric string as an ID and options obj
 * @type {Peer}
 */
const peer = new Peer(''+Math.floor(Math.random()*2**18).toString(36).padStart(4,0), {
    host: location.hostname,
    debug: 1,
    path: '/myapp',
    port: 9000,
    secure: true
});

window.peer = peer;

/**
 * Gets the local audio stream of the current caller
 * @param callbacks - an object to set the success/error behaviour
 * @returns {void}
 */
function getLocalStream() {
    const constraints = {video: false, audio: true}

    navigator.mediaDevices.getUserMedia(constraints).then( stream => {
        setLocalStream(stream);
    }).catch( err => {
        console.log("getLocalStream() error: " + err);
    });
}

/**
 * Sets the src of the HTML element on the page to the local stream
 * @param stream
 * @returns {void}
 */
function setLocalStream(stream) {
    window.localAudio.srcObject = stream;
    window.localAudio.autoplay = true;
    window.localStream = stream;
}

/**
 * Sets the src of the HTML element on the page to the remote stream
 * @param stream
 * @returns {void}
 */
function setRemoteStream(stream) {
    window.remoteAudio.srcObject = stream;
    window.remoteAudio.autoplay = true;
    window.peerStream = stream;
}

/**
 * Connect the peers
 * @returns {void}
 */
function connectPeers() {
    conn = peer.connect(code)
}

/**
 * Get the connection code, connect peers and create a call
 */
const initCall = function() {
    connectPeers();
    const call = peer.call(code, window.localStream);
    /**
     * when the call is streaming, set the remote stream for the caller
     */
    call.on('stream', function(stream) {
        setRemoteStream(stream);
    });
}

socket.on('callPeer', function(data) {
    code = data.peerId;
    console.log('Calling peer:', code);
    initCall();
});

/**
 * Close the connection between peers
 */
socket.on('hangup', function() {
    console.log('Call ended');
    conn.close();
});

/**
 * When the peer has connected to the server, diplay the peer ID
 */
peer.on('open', function () {
    console.log('My peer ID is: ' + peer.id);
    currentUserEmoji = localStorage.getItem('currentUserEmoji') || currentUserEmoji;
    socket.emit('registerUser', { peerId: peer.id, emoji: currentUserEmoji });
});

/**
 * When a data connection between peers is open, get the connecting peer's details
 */
peer.on('connection', function(connection){
    conn = connection;
    peer_id = connection.peer;
});

/**
 * When a call has been created, answer it and set the remote stream for the person being called
 */
peer.on('call', function(call) {
    call.answer(window.localStream)
    call.on('stream', function(stream) {
        setRemoteStream(stream);
    });
    conn.on('close', function (){
        console.log('Call ended');
    });
});

/**
 * Log errors to the console when they occur
 */
peer.on('error', err => console.error(err));

getLocalStream();
