const ScheduleService = require('../services/schedule.service')

class ScheduleController {
    async getCurrentSchedule(req, res) {
        const {date} = req.body.date
        return res.json(
            await ScheduleService.getCurrentSchedule(date)
        )
    }

    async createNewLesson(req, res) {
        const lesson = req.body
        // return ktp_id
        return res.json(
            await ScheduleService.createNewLesson(lesson)
        )
    }
    async updateSchedule(req, res) {
        const lesson = req.body
        // return ktp_id
        return res.json(
            await ScheduleService.updateSchedule(lesson)
        )
    }
}

module.exports = new ScheduleController()