const express = require('express'),
    router = express.Router(),
    CabinetController = require('../controllers/cabinets.controller'),
    CabinetsService = require('../services/cabinets.service')

router.get('/all', CabinetController.getCabinets)

module.exports = router