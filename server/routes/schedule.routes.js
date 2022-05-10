const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller')

router.get('/getCurrentSchedule/', ScheduleController.getCurrentSchedule)
router.post('/createNewLesson', ScheduleController.createNewLesson)


module.exports = router