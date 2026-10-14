const express = require('express')
const appointmentController = require('../controller/appointment.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')

const router = express.Router();

router.post('/create/appointment',authenticateToken,authorizePermission("create:appointment"),appointmentController.createAppointment)
router.get('/get/appointments',authenticateToken,authorizePermission("read:appointment"),appointmentController.getAppointments)
// for doctor to get their appointments
router.get('/get/appointment/me',authenticateToken,authorizePermission("read:appointment"),appointmentController.getAppointmentListOfDoctor)
// for admin get appointments with group of doctor
router.get('/get/appointment/admin',authenticateToken,authorizePermission("read:appointment"),appointmentController.getAppointmentByDoctor)
// for receptionist to get appointments with group of doctor
router.get('/get/appointment/receptionist/dashboard', authenticateToken, authorizePermission("read:appointment", "create:appointment", "create:appointmentStatus", "read:patient", "read:doctor", "read:clinic"), appointmentController.getReceptionistDashboard);
// for patient dashboard
router.get('/get/appointment/patient/dashboard', authenticateToken, authorizePermission("read:appointment"), appointmentController.getPatientDashboard);
// for patient appointment list
router.get('/get/appointments/patient/my', authenticateToken, authorizePermission("read:appointment"), appointmentController.getMyPatientAppointments);

router.get('/get/appointment/:id',authenticateToken,authorizePermission("read:appointment"),appointmentController.getAppointmentById)
router.put('/update/appointment/:id',authenticateToken,authorizePermission("update:appointment"),appointmentController.updateAppointment)
router.put('/update/appointment/status/:id',authenticateToken,authorizePermission("create:appointmentStatus","update:appointmentStatus"),appointmentController.updateAppointmentStatus)
router.put("/delete/appointment/:id",authenticateToken,authorizePermission("delete:appointment"),appointmentController.deleteAppointment)
router.get('/get/appointments/my', authenticateToken, authorizePermission("read:appointment"), appointmentController.getMyAllAppointments);


module.exports = router;