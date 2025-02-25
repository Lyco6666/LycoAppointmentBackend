const db = require("../config/db");
const sendEmail = require("./emailService");

const notifyUpcomingAppointments = async () => {
    try {
        const query = `
            SELECT a.id, a.date, a.time, u.name, u.email
            FROM appointments a
            JOIN users u ON a.customer_uid = u.uid
            WHERE a.status = 'scheduled' 
            AND TIMESTAMP(a.date, a.time) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 1 MINUTE)`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("❌ Error fetching upcoming appointments:", err);
                return;
            }

            results.forEach(appointment => {
                const message = `Hello ${appointment.name},\n\nReminder: Your appointment is scheduled on ${appointment.date} at ${appointment.time}.`;
                sendEmail(appointment.email, "📅 Appointment Reminder", message);
                console.log(`✅ Notification sent to ${appointment.email} for Appointment ID ${appointment.id}`);
            });
        });
    } catch (error) {
        console.error("❌ Error in notifyUpcomingAppointments:", error);
    }
};

const autoCancelExpiredAppointments = async () => {
    try {
        const query = `
            SELECT a.id, a.date, a.time, u.name, u.email
            FROM appointments a
            JOIN users u ON a.customer_uid = u.uid
            WHERE a.status = 'scheduled' 
            AND TIMESTAMP(a.date, a.time) < NOW()`;

        db.query(query, (err, results) => {
            if (err) {
                console.error("❌ Error fetching expired appointments:", err);
                return;
            }

            results.forEach(appointment => {
                const updateQuery = "UPDATE appointments SET status = 'canceled' WHERE id = ?";
                db.query(updateQuery, [appointment.id], (updateErr) => {
                    if (updateErr) {
                        console.error(`❌ Error canceling appointment ${appointment.id}:`, updateErr);
                        return;
                    }

                    const message = `Hello ${appointment.name},\n\nYour appointment on ${appointment.date} at ${appointment.time} was automatically canceled because it was not completed.`;
                    sendEmail(appointment.email, "❌ Appointment Canceled", message);
                    console.log(`✅ Appointment ID ${appointment.id} canceled and user notified.`);
                });
            });
        });
    } catch (error) {
        console.error("❌ Error in autoCancelExpiredAppointments:", error);
    }
};

module.exports = { notifyUpcomingAppointments, autoCancelExpiredAppointments };
