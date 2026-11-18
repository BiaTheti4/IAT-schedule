const ScheduleService = require('../services/schedule.service')
const moment = require("moment");
const ktpService = require("../services/ktp.service");

class ScheduleController {
  async getHoursControl(req, res) {
    const date = req.query.date || moment().format('YYYY-MM-DD');
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({message: 'Некорректная дата'});
    }
    try {
      return res.json(await require('../services/hours-control.service').getReport(date));
    } catch (error) {
      console.error('Hours control:', error);
      return res.status(500).json({message: 'Не удалось рассчитать контроль часов'});
    }
  }

  async getCurrentSchedule(req, res) {
    const date = req.query.date || new Date()
    const year = ktpService.getActiveYear(date);
    const scheduleData = await ScheduleService.getCurrentSchedule(date);
    return res.json({
        current: ScheduleService.parseSchedule(scheduleData.main),
        custom: scheduleData.custom,
        curriculumCabinets: await require('../services/cabinets.service').getCurriculumCabinets(year),
        feature: await ScheduleService.getScheduleFeature()
      }
    )
  }

  async getSchedule(req, res) {
    const dateStart = req.query.start || new Date()
    const dateEnd = req.query.end || new Date()
    try {
      return res.json(await ScheduleService.getScheduleOnPeriod(dateStart, dateEnd))
    } catch (error) {
      if (error instanceof RangeError) return res.status(400).json({message: error.message})
      throw error
    }
  }

  async getWeekHours(req, res) {
    return res.json(
      await ScheduleService.getWeekHours(req.query.date)
    )
  }

  async updateSchedule(req, res) {
    const lessons = req.body.data;
    if (req.body.remove && req.body.remove.length) {
      await ScheduleService.removeSchedule(req.body.remove);
    }
    const result = await ScheduleService.updateSchedule(lessons);
    return res.json({
      status: result === true,
      errors: result === true ? null : result
    });
  }

  async correct(req, res) {
    return res.json({
      list: await ScheduleService.correctScheduleOrder(req.query.ktpId, +req.query.correct === 1),
      overlay: await ScheduleService.getScheduleOverlay()
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

  async clone(req, res) {
    const fromDate = moment(req.query.from_date);
    const toDate = moment(req.query.to_date);
    if (!fromDate || !toDate) {
      return res.json({status: false, error: 'not valid dates'});
    } else if (fromDate.toDate() === toDate.toDate()) {
      return res.json({status: false, error: 'equal dates'});
    } else {
      const result = await ScheduleService.cloneFromDate(req.query.from_date, req.query.to_date, req.query.course);
      if (result === true) {
        return res.json({status: true});
      } else {
        return res.json({status: false, error: result});
      }
    }
  }

  async clearDay(req, res) {
    const date = req.body.date;
    if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
      return res.status(400).json({status: false, error: 'Некорректная дата'});
    }
    try {
      await ScheduleService.clearDay(date);
      return res.json({status: true});
    } catch (error) {
      console.error('Clear schedule day:', error);
      return res.status(500).json({status: false, error: 'Не удалось очистить расписание'});
    }
  }

}

module.exports = new ScheduleController()
