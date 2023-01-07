const express = require('express'),
    router = express.Router(),
    LoginController = require('../controllers/login.controller')


router.post('/login', LoginController.login)
router.post('/logout', LoginController.logout)

module.exports = router