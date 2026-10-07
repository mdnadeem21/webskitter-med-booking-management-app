const express = require('express')
const patientController = require('../controller/patient.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')

const router = express.Router();

router.post('/register/patient',patientController.registerPatient)
router.get('/get/patients',authenticateToken,authorizePermission("read:patient"),patientController.getPatients)
router.get('/get/patient/:id',authenticateToken,patientController.getPatientById)
router.put("/update/patient/:id",authenticateToken,patientController.updatePatient)
router.put('/delete/patient',authenticateToken,authorizePermission("delete:patient"),patientController.deletePatient)
router.post('/verify/patient',patientController.verifyPatientEmail);
router.post('/resend/email',patientController.resendOtp)
router.post('/change/password',authenticateToken,patientController.changePassword)

module.exports=router