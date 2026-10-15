const express =require('express')
const doctorController = require('../controller/doctor.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require("../util/upload.file.on.local")

const router = express.Router()

router.post('/register',uploadFile.single('profileImage'),authenticateToken,authorizePermission("create:doctor"),doctorController.registerDoctor);
router.post('/login',doctorController.loginDoctor);
router.get('/get/doctors',authenticateToken,authorizePermission("read:doctor"),doctorController.getAllDoctors);
router.get('/get/doctor/:id',authenticateToken,authorizePermission("read:doctor"),doctorController.getDoctorById);
router.put('/update/doctor/:id',uploadFile.single('avatar'),authenticateToken,authorizePermission("update:doctor"),doctorController.updateDoctor);
router.put('/delete/doctor/:id',authenticateToken,authorizePermission("delete:doctor"),doctorController.deleteDoctor);
router.post('/verify/doctor',doctorController.verifyDoctor);
router.post('/resend/doctor-otp',doctorController.resendOtp);
router.post('/change-password/doctor',authenticateToken,authorizePermission("update:doctor"),doctorController.changePassword);

router.get('/get/me', authenticateToken, authorizePermission("read:doctor"), doctorController.getMyProfile);
router.put('/update/me', uploadFile.single('profileImage'), authenticateToken, authorizePermission("update:doctor"), doctorController.updateMyProfile);


module.exports = router