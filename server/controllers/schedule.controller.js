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

        // console.log(lesson)
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

    async deleteSchedule(req, res) {
        const lesson = req.body
        return res.json(
            await ScheduleService.deleteSchedule(lesson)
        )
    }
    async getPrintSchedule(req,res){
        const date=req.body.date
        return res.json(
            await ScheduleService.getPrintSchedule(date)
        )
    }
}

module.exports = new ScheduleController()