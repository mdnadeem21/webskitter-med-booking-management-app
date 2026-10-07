const express = require('express')
const userController = require('../controller/user.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')
const uploadFile = require("../util/upload.file.on.local")

const router = express.Router()


router.post('/register/user',uploadFile.single('avatar'),userController.registerUser)
router.post('/login/user',userController.loginUser)
router.post('/verify-otp',userController.verifyOtp)
router.post('/resend-otp',userController.resendOtp)
router.post('/forgot-password',userController.resetPasswordLink)
router.post('/reset-password/:id/:token',userController.resetPassword)
router.post('/update-password/:id',authenticateToken,userController.updatePassword)
router.post('/logout',authenticateToken,userController.logoutUser)


module.exports = router;