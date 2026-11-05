const express = require('express'),
    router = express.Router(),
    ScheduleController = require('../controllers/schedule.controller'),
    middleware = require('../middleware')


router.get('/getCurrentSchedule', middleware.checkToken, ScheduleController.getCurrentSchedule)
router.get('/period', middleware.checkToken, ScheduleController.getSchedule)
router.post('/updateSchedule', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.updateSchedule)
router.get('/getWeekHours', middleware.checkToken, ScheduleController.getWeekHours)
router.get('/hours-control', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.getHoursControl)
router.get('/correct', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.correct)
router.get('/correct-overlay', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.correctOverlay)
router.get('/compare', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.compare)
router.get('/clone', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.clone)
router.post('/clearDay', [middleware.checkToken, middleware.checkPublicIp], ScheduleController.clearDay)

// router.post('/week', ScheduleController.getWeekSchedule)
// router.post('/getPrintSchedule', ScheduleController.getPrintSchedule)
// router.post('/deleteSchedule',ScheduleController.deleteSchedule)
// router.get('/getLessonId',ScheduleController.getLessonId)
// router.post('/getEmployeeSchedule',ScheduleController.getEmployeeSchedule)
// router.post('/getCabinetSchedule',ScheduleController.getCabinetSchedule)

module.exports = router
