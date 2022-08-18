const express = require('express'),
    router = express.Router(),
    CabinetController = require('../controllers/cabinets.controller')


router.get('/all', CabinetController.getCabinets)
router.get('/test', CabinetController.test)

module.exports = router