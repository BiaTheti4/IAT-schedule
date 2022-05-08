const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController'),
    KtpService = require('../services/ktp.service')

router.get('/all', KtpController.getSubjectsByGroup)

module.exports = router