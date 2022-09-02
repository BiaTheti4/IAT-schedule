const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController')

router.get('/getTeachers/', KtpController.getTeachers)
router.get('/getSubjects', KtpController.getSubjects)
router.get('/getEmployees', KtpController.getEmployees)

module.exports = router