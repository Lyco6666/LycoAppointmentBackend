const express = require("express");
const {
    bookAppointment,
    getCustomerAppointments,
    getAllAdminAppointments,
    updateAppointment,
    getAppointment
} = require("../controllers/appointmentController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/book", authMiddleware, bookAppointment);
router.get("/my-appointments", authMiddleware, getCustomerAppointments);
router.get("/all-appointments", authMiddleware, adminMiddleware, getAllAdminAppointments);
router.put("/update-status", authMiddleware, adminMiddleware, updateAppointment);
router.get("/:id", authMiddleware, getAppointment);

module.exports = router;
