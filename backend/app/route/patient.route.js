const express = require('express')
const upload = require("../util/upload.file.on.local")
const patientController = require('../controller/patient.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')

const router = express.Router();

router.post('/register',upload.single('patientImage'),patientController.registerPatient);
router.post('/login',patientController.loginPatient);
router.get('/get/patients', authenticateToken, authorizePermission("read:patient"), patientController.getAllPatients);
router.get('/get/me', authenticateToken, authorizePermission("read:patient"), patientController.getMyProfile);
router.put('/update/me', authenticateToken, authorizePermission("update:patient"), patientController.updateMyProfile);
router.post('/change-password/me', authenticateToken, patientController.changeMyPassword);

router.put('/toggle/patient/:id', authenticateToken, authorizePermission("update:patient"), patientController.togglePatient);
router.get('/get/patient/:id',authenticateToken,patientController.getPatientById)
router.put("/update/patient/:id",authenticateToken,patientController.updatePatient)
router.put('/delete/patient/:id',authenticateToken,authorizePermission("delete:patient"),patientController.deletePatient)
router.post('/verify/patient',patientController.verifyPatientEmail);
router.post('/resend/email',patientController.resendOtp)
// router.post('/change/password',authenticateToken,patientController.changePassword)

module.exports=router