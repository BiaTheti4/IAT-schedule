const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller')

router.post('/getCurrentSchedule', ScheduleController.getCurrentSchedule)
router.post('/createNewLesson', ScheduleController.createNewLesson)
router.post('/updateSchedule', ScheduleController.updateSchedule)
router.post('/week', ScheduleController.getWeekSchedule)
router.post('/getPrintSchedule', ScheduleController.getPrintSchedule)
router.post('/getWeekHours', ScheduleController.getWeekHours)
router.post('/deleteSchedule',ScheduleController.deleteSchedule)
router.get('/getLessonId',ScheduleController.getLessonId)
router.post('/getEmployeeSchedule',ScheduleController.getEmployeeSchedule)
router.post('/getCabinetSchedule',ScheduleController.getCabinetSchedule)

module.exports = router