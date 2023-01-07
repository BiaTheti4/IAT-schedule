const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController'),
    middleware = require('../middleware')

router.get('/getTeachers/', middleware.checkToken, KtpController.getTeachers)
router.get('/getSubjects', middleware.checkToken, KtpController.getSubjects)
router.get('/getEmployees', middleware.checkToken, KtpController.getEmployees)

module.exports = router