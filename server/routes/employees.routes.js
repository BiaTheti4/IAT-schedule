const express = require('express'),
    router = express.Router(),
    EmployeesController = require('../controllers/employees.controller'),
    EmployeesService = require('../services/employees.service')

router.get('/all', EmployeesController.getEmployees)

module.exports = router