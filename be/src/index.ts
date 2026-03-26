import cron from "node-cron";
import app from "./app";
import { updateActiveFlights } from "./services/flight-updater";
import { archiveCompletedFlights } from "./services/archiver";
import { updateUpcomingFlightWeather } from "./services/weather-updater";

const port = Number(process.env.PORT) || 3001;

// Cron jobs
// Poll active flights every 90 seconds
cron.schedule("*/90 * * * * *", async () => {
    try {
        const count = await updateActiveFlights();
        if (count > 0) {
            console.log(`Updated ${count} active flight(s)`);
        }
    } catch (err) {
        console.error("Flight update cron error:", err);
    }
});

// Archive completed flights every 2 hours
cron.schedule("0 */2 * * *", async () => {
    try {
        await archiveCompletedFlights();
    } catch (err) {
        console.error("Archive cron error:", err);
    }
    try {
        const count = await updateUpcomingFlightWeather();
        if (count > 0) {
            console.log(`Updated weather for ${count} upcoming flight(s)`);
        }
    } catch (err) {
        console.error("Weather update cron error:", err);
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
