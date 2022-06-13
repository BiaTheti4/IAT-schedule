const express = require('express'),
    router = express.Router(),
    GroupsController = require('../controllers/groups.controller')

router.get('/all', GroupsController.getGroups)
router.get('/specs', GroupsController.getSpecs)

module.exports = router