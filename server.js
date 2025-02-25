const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const cron = require('node-cron');
const { notifyUpcomingAppointments, autoCancelExpiredAppointments } = require('./utils/scheduler');

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});

cron.schedule("0 * * * *", async () => {
    console.log("Running scheduled tasks...");
    await notifyUpcomingAppointments();
    await autoCancelExpiredAppointments();
});
