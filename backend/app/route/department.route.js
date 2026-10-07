const express = require('express')
const departmentController = require('../controller/department.controller')
const { authenticateToken, authorizePermission } = require('../middleware/auth.role.check')


const router = express.Router()

router.post('/register/department',authenticateToken, authorizePermission('create:department'),departmentController.createDepartment)
router.get('/get/department',authenticateToken, authorizePermission('read:department'),departmentController.getDepartments)
router.get('/get/department/:id',authenticateToken, authorizePermission('read:department'),departmentController.getDepartmentById)
router.put('/update/department/:id',authenticateToken, authorizePermission('update:department'),departmentController.updateDepartment)
router.put('/delete/department/:id',authenticateToken, authorizePermission('delete:department'),departmentController.deleteDepartment)

module.exports = router