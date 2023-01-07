const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller'),
    middleware = require('../middleware')


router.get('/getCurrentSchedule', middleware.checkToken, ScheduleController.getCurrentSchedule)
router.get('/period', middleware.checkToken, ScheduleController.getSchedule)
router.post('/updateSchedule', middleware.checkToken, ScheduleController.updateSchedule)
router.get('/getWeekHours', middleware.checkToken, ScheduleController.getWeekHours)
router.get('/correct', middleware.checkToken, ScheduleController.correct)
router.get('/correct-overlay', middleware.checkToken, ScheduleController.correctOverlay)
router.get('/compare', middleware.checkToken, ScheduleController.compare)

// router.post('/week', ScheduleController.getWeekSchedule)
// router.post('/getPrintSchedule', ScheduleController.getPrintSchedule)
// router.post('/deleteSchedule',ScheduleController.deleteSchedule)
// router.get('/getLessonId',ScheduleController.getLessonId)
// router.post('/getEmployeeSchedule',ScheduleController.getEmployeeSchedule)
// router.post('/getCabinetSchedule',ScheduleController.getCabinetSchedule)

module.exports = router