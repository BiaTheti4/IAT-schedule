const express = require('express'),
    router = express.Router(),
    GroupsController = require('../controllers/groups.controller'),
    middleware = require('../middleware')


router.get('/all', middleware.checkToken, GroupsController.getGroups)
router.get('/specs', middleware.checkToken, GroupsController.getSpecs)

module.exports = router