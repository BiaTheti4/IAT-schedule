const express = require('express'),
    router = express.Router(),
    GroupsController = require('../controllers/groups.controller')

router.get('/all', GroupsController.getGroups)

module.exports = router