const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller')

router.get('/getCurrentSchedule', ScheduleController.getCurrentSchedule)
router.get('/period', ScheduleController.getSchedule)
router.post('/updateSchedule', ScheduleController.updateSchedule)
// router.post('/week', ScheduleController.getWeekSchedule)
// router.post('/getPrintSchedule', ScheduleController.getPrintSchedule)
router.get('/getWeekHours', ScheduleController.getWeekHours)
router.get('/correct', ScheduleController.correct)
router.get('/correct-overlay', ScheduleController.correctOverlay)
router.get('/compare', ScheduleController.compare)
// router.post('/deleteSchedule',ScheduleController.deleteSchedule)
// router.get('/getLessonId',ScheduleController.getLessonId)
// router.post('/getEmployeeSchedule',ScheduleController.getEmployeeSchedule)
// router.post('/getCabinetSchedule',ScheduleController.getCabinetSchedule)

module.exports = router