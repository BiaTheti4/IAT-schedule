const ScheduleService = require('../services/schedule.service')

class ScheduleController {
    async getCurrentSchedule(req, res) {
        const date = req.query.date || new Date()
        return res.json({
                current: ScheduleService.parseSchedule(await ScheduleService.getCurrentSchedule(date)),
                feature: await ScheduleService.getScheduleFeature()
            }
        )
    }

    async getSchedule(req, res) {
        const dateStart = req.query.start || new Date()
        const dateEnd = req.query.end || new Date()
        return res.json(
            await ScheduleService.getScheduleOnPeriod(dateStart, dateEnd)
        )
    }

    async getWeekHours(req, res) {
        return res.json(
            await ScheduleService.getWeekHours(req.query.date)
        )
    }

    async updateSchedule(req, res) {
        const lessons = req.body.data
        let result = await ScheduleService.updateSchedule(lessons, req.body.date);
        return res.json({
                status: result === true,
                errors: result === true ? null : result
            }
        )
    }

    async correct(req, res) {
        return res.json({list: await ScheduleService.correctScheduleOrder()});
    }

}

module.exports = new ScheduleController()