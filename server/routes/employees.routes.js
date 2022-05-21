const express = require('express'),
    router = express.Router(),
    EmployeesController = require('../controllers/employees.controller'),
    EmployeesService = require('../services/employees.service')

router.get('/all', EmployeesController.getEmployees)
router.get('/teacher', EmployeesController.getTeacherName)

module.exports = router