const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller')

router.post('/getCurrentSchedule', ScheduleController.getCurrentSchedule)
router.post('/createNewLesson', ScheduleController.createNewLesson)
router.post('/updateSchedule', ScheduleController.updateSchedule)
router.post('/week', ScheduleController.getWeekSchedule)
router.post('/getPrintSchedule', ScheduleController.getPrintSchedule)
router.delete('/deleteSchedule',ScheduleController.deleteSchedule)

module.exports = router