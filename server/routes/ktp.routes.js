const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController'),
    KtpService = require('../services/ktp.service')

router.get('/getTeachers', KtpController.getTeachers)
router.get('/getSubjects',KtpController.getSubjects)

module.exports = router