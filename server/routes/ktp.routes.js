const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController')

router.get('/getTeachers/:ktpId', KtpController.getTeachers)
router.get('/getSubjects/:groupId',KtpController.getSubjects)

module.exports = router