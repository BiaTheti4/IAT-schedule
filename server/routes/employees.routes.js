const express = require('express'),
    router = express.Router(),
    EmployeesController = require('../controllers/employees.controller'),
    middleware = require('../middleware')

router.get('/all', middleware.checkToken, EmployeesController.getEmployees)
router.get('/teacher', middleware.checkToken, EmployeesController.getTeacherName)
router.post('/busynessEmployees', middleware.checkToken, EmployeesController.getBusynessEmployees)

module.exports = router