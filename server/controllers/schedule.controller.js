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
        return res.json(
            await ScheduleService.createNewLesson(req.body)
        )
    }

    async updateSchedule(req, res) {
        const lesson = req.body
        return res.json(
            await ScheduleService.updateSchedule(lesson)
        )
    }

    async getWeekHours(req, res) {
        const startWeek = req.body.startWeek
        const endWeek = req.body.endWeek
        const groupId = req.body.groupId
        const currentDate = req.body.currentDate
        return res.json(
            await ScheduleService.getWeekHours(currentDate, startWeek, endWeek, groupId)
        )
    }

    async deleteSchedule(req, res) {
        const lessonId = req.body.id
        return res.json(
            await ScheduleService.deleteSchedule(lessonId)
        )
    }

    async getPrintSchedule(req, res) {
        const date = req.body.date
        return res.json(
            await ScheduleService.getPrintSchedule(date)
        )
    }
    async getLessonId(req, res) {
        return res.json(
            await ScheduleService.getLessonId()
        )
    }
}

module.exports = new ScheduleController()