const express = require('express'),
    router = express.Router(),
    CabinetController = require('../controllers/cabinets.controller'),
    middleware = require('../middleware')


router.get('/all', middleware.checkToken, CabinetController.getCabinets)
router.get('/test', middleware.checkToken, CabinetController.test)

module.exports = router