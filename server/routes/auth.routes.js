const express = require('express'),
    router = express.Router(),
    LoginController = require('../controllers/login.controller'),
    middleware = require('../middleware');


router.get('/ip', LoginController.ip)
router.post('/login', [middleware.checkPublicIp], LoginController.login)
router.post('/logout', LoginController.logout)

module.exports = router