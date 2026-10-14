const express = require("express");
const adminController = require("../controller/admin.controller");
const { authenticateToken, authorizePermission } = require("../middleware/auth.role.check");    
const router = express.Router();

router.post("/login", adminController.loginAdmin);
router.get('/get/admin/stats', authenticateToken, authorizePermission("read:appointment"), adminController.getAdminStats);
router.get('/get/me', authenticateToken, adminController.getAdminProfile);
router.put('/update/me', authenticateToken, adminController.updateAdminProfile);
router.post('/change-password', authenticateToken, adminController.changePassword);

module.exports = router;