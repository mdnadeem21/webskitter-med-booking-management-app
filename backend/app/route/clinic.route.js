const express =require('express')
const clinicController = require("../controller/clinic.controller")
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')


const router=express.Router()

router.post('/register/clinic',authenticateToken, authorizePermission('create:clinic'),clinicController.createClinic)
router.get('/get/clinics',authenticateToken,authorizePermission('read:clinic'),clinicController.getClinics)
router.get('/get/clinic/:id',authenticateToken,authorizePermission('read:clinic'),clinicController.getClinicById)
router.put('/update/clinic/:id',authenticateToken,authorizePermission('update:clinic'),clinicController.updateClinic)
router.put('/delete/clinic/:id',authenticateToken,authorizePermission('delete:clinic'),clinicController.deleteClinic)


module.exports=router