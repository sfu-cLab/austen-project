// Script to generate timeslots based on a start time and duration input by the user for testing purposes

const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function generateTimeslots(startTimeString, duration) {
  let timeslots = [];
	let startTime = new Date(`1970-01-01T${startTimeString}:00Z`);

	for (let i = 0; i < 8; i++) {
		let endTime = new Date(startTime.getTime() + duration * 60000);
		let timeslot = {
			start: startTime.toISOString().substring(11, 16),
			end: endTime.toISOString().substring(11, 16),
			timeslot: i + 1,
		};
		timeslots.push(timeslot);
		startTime = endTime;
	}

	return { timeslots };
}

rl.question("Enter the start time (HH:MM): ", (startTimeInput) => {
	rl.question(
		"Enter the duration of each timeslot in minutes: ",
		(durationInput) => {
			try {
				let timeslotsData = generateTimeslots(
					startTimeInput,
					Number(durationInput)
				);
				console.log("Generated timeslots:");
				console.log(JSON.stringify(timeslotsData, null, 4));

				fs.writeFile(
					"timeslots.json",
					JSON.stringify(timeslotsData, null, 4),
					(err) => {
						if (err) throw err;
						console.log("Timeslots have been saved to 'timeslots.json'");
					}
				);
			} catch (e) {
				console.error(
					`Error: ${e.message}. Please make sure the time is in HH:MM format and the duration is a number.`
				);
			} finally {
				rl.close();
			}
		}
	);
});
