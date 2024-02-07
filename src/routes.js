const callService = require("./services/callService");

module.exports = function (app) {
	app.get("/api/schedule", async (req, res) => {
        let data = await callService.getScheduledCalls();
		res.send(data);
	});
};