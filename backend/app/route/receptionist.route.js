const express = require('express');
const receptionistController = require('../controller/receptionist.controller');
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check');
const upload = require("../util/upload.file.on.local")
const router = express.Router();

// public
router.post('/login', receptionistController.loginReceptionist);

// create/delete sirf admin
router.post('/register',upload.single("profileImage") ,authenticateToken, authorizePermission("create:receptionist"), receptionistController.registerReceptionist);
router.put('/toggle/:id', authenticateToken, authorizePermission("delete:receptionist"), receptionistController.toggleReceptionist);

// read/update — admin + receptionist dono
router.get('/get/receptionists', authenticateToken, authorizePermission("read:receptionist"), receptionistController.getAllReceptionists);
router.get('/get/me', authenticateToken, authorizePermission("read:receptionist"), receptionistController.getMyProfile);
router.put('/update/me', authenticateToken, authorizePermission("update:receptionist"), receptionistController.updateMyProfile);

router.get('/get/receptionist/:id', authenticateToken, authorizePermission("read:receptionist"), receptionistController.getReceptionistById);
router.put('/update/receptionist/:id', authenticateToken, authorizePermission("update:receptionist"), receptionistController.updateReceptionist);

// receptionist khud ka password change
router.post('/change-password/receptionist', receptionistController.changePassword);

module.exports = router;