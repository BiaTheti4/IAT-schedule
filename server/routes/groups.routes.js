const express = require('express'),
    router = express.Router(),
    GroupsController = require('../controllers/groups.controller'),
    GroupsService = require('../services/groups.service')

router.get('/all', GroupsController.getGroups)

module.exports = router