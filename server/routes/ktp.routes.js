const express = require('express'),
    router = express.Router(),
    KtpController = require('../controllers/ktpController')

router.post('/getTeachers/', KtpController.getTeachers)
router.post('/getSubjects',KtpController.getSubjects)

module.exports = router