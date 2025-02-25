const { Appointment } = require("../models/appointmentModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/emailService");

const bookAppointment = async (req, res) => {
    try {
        const { date, time, purpose } = req.body;
        const customer_uid = req.user.uid;
        const newAppointment = new Appointment(null, customer_uid, date, time, purpose, "scheduled");

        newAppointment.save((err) => {
            if (err) return res.status(500).json({ message: "Error booking appointment", error: err.message });

            sendEmail(req.user.email, "📅 Appointment Confirmed", `Your appointment for ${purpose} is scheduled on ${date} at ${time}.`);
            res.status(201).json({ message: "Appointment booked successfully" });
        });
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({ message: error.message });
    }
};

const updateAppointment = async (req, res) => {
    try {
        const { id, status, date, time } = req.body;

        Appointment.updateStatus(id, status, date, time, (err, updatedAppointment) => {
            if (err) return res.status(500).json({ message: "Error updating appointment", error: err.message });

            let subject, message;
            switch (status) {
                case "scheduled":
                    subject = "📅 Appointment Rescheduled";
                    message = `Your appointment has been rescheduled to ${updatedAppointment.date} at ${updatedAppointment.time}.`;
                    break;
                case "canceled":
                    subject = "❌ Appointment Canceled";
                    message = `Your scheduled appointment on ${updatedAppointment.date} at ${updatedAppointment.time} has been canceled.`;
                    break;
                case "completed":
                    subject = "✅ Appointment Completed";
                    message = "Your appointment has been successfully completed.";
                    break;
                default:
                    return res.status(400).json({ message: "⚠️ Invalid status provided." });
            }

            User.findByUid(updatedAppointment.customer_uid, (userErr, user) => {
                if (userErr) return res.status(500).json({ message: "Error fetching user", error: userErr.message });

                if (!user || user.length === 0) {
                    return res.status(404).json({ message: "User not found for the appointment." });
                }

                const email = user[0].email;
                sendEmail(email, subject, message);

                res.status(200).json({ message: "Appointment updated successfully" });
            });
        });
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: error.message });
    }
};

const getCustomerAppointments = async (req, res) => {
    try {
        Appointment.findByUid(req.user.uid, (err, appointments) => {
            if (err) return res.status(500).json({ message: "Error fetching appointments", error: err.message });

            if (appointments.length === 0) {
                return res.status(200).json({ message: "No appointments found." });
            }

            res.status(200).json(appointments);
        });
    } catch (error) {
        console.error("Error fetching customer appointments:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAllAdminAppointments = async (req, res) => {
    try {
        Appointment.findAll((err, appointments) => {
            if (err) return res.status(500).json({ message: "Error fetching all appointments", error: err.message });

            if (appointments.length === 0) {
                return res.status(200).json({ message: "No appointments found." });
            }

            res.status(200).json(appointments);
        });
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        Appointment.findById(appointmentId, (err, appointment) => {
            if (err) return res.status(500).json({ message: "Error fetching appointment", error: err.message });

            if (!appointment) {
                return res.status(404).json({ message: "Appointment not found." });
            }

            res.status(200).json(appointment);
        });
    } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    bookAppointment, updateAppointment,
    getCustomerAppointments, getAllAdminAppointments,
    getAppointment
};
