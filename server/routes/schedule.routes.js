const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller')

router.get('/getCurrentSchedule/', ScheduleController.getCurrentSchedule)
router.post('/createNewLesson', ScheduleController.createNewLesson)
router.post('/updateSchedule', ScheduleController.updateSchedule)
router.get('/getWeekSchedule', ScheduleController.getWeekSchedule)
router.delete('/deleteSchedule',ScheduleController.deleteSchedule)

module.exports = router