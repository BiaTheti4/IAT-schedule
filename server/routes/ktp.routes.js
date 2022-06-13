const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController')

router.post('/getTeachers/', KtpController.getTeachers)
router.post('/getSubjects', KtpController.getSubjects)
router.get('/getEmployees', KtpController.getEmployees)

module.exports = router