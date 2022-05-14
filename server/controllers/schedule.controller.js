const ScheduleService = require('../services/schedule.service')

class ScheduleController {
    async getCurrentSchedule(req, res) {
        const date = req.body.date

        return res.json(
            await ScheduleService.getCurrentSchedule(date)
        )
    }

    async getWeekSchedule(req, res) {
        const date = req.body.date
        return res.json(
            await ScheduleService.getWeekSchedule(date)
        )
    }

    async createNewLesson(req, res) {
        const lesson = req.body
        return res.json(
            await ScheduleService.createNewLesson(lesson)
        )
    }

    async updateSchedule(req, res) {
        const lesson = req.body
        return res.json(
            await ScheduleService.updateSchedule(lesson)
        )
    }

    async deleteSchedule(req, res) {
        const lesson = req.body
        return res.json(
            await ScheduleService.deleteSchedule(lesson)
        )
    }
}

module.exports = new ScheduleController()