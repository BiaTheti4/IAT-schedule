const ScheduleService = require('../services/schedule.service')

class ScheduleController {
    async getCurrentSchedule(req, res) {
        const date = req.query.date || new Date()
        const scheduleData = await ScheduleService.getCurrentSchedule(date);
        return res.json({
                current: ScheduleService.parseSchedule(scheduleData.main),
                custom: scheduleData.custom,
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
        let remove = result = await ScheduleService.removeSchedule(req.body.remove)
        return res.json({
                status: result === true,
                errors: result === true ? null : result
            }
        )
    }

    async correct(req, res) {
        return res.json({
            list: await ScheduleService.correctScheduleOrder(req.query.ktpId, +req.query.correct === 1),
            overlay: await ScheduleService.getScheduleOverlay(req.query.ktpId, +req.query.correct === 1)
        });
    }

    async correctOverlay(req, res) {
        return res.json({
            status: await ScheduleService.correctScheduleOverlay(req.query.ids)
        });
    }

    async compare(req, res) {
        return res.json({list: await ScheduleService.compareJournal()});
    }

}

module.exports = new ScheduleController()