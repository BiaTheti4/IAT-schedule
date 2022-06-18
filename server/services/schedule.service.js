const sequelize = require("../models");
const moment = require('moment');
const ScheduleModel = require("../models/schedule.model");

class ScheduleService {
    async getCurrentSchedule(date) {
        return this.getScheduleOnPeriod(date, date);
    }

    async getScheduleOnPeriod(dateStart, dateEnd) {
        return await sequelize.query(
            'select sch.id as id,' +
            'sch.date,' +
            'sch.ktp_id,' +
            'g.groupId,' +
            'g.name,' +
            'g.course,' +
            'sch.status,' +
            'sch.event,' +
            'sch.cabinet_id,' +
            'c.number, ' +
            'sch.optional_cabinet_id, ' +
            'cab.number as optional_cabinet, ' +
            'sch.lesson_number,' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'sch.teacher_id,' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp, ' +
            'sch.optional_teacher_id from schedule_new as sch ' +
            ' inner join employees e on sch.teacher_id = e.employeeId ' +
            ' left join employees emp on sch.optional_teacher_id=emp.employeeId ' +
            ' inner join cabinets c on sch.cabinet_id = c.id ' +
            ' left join cabinets cab on sch.optional_cabinet_id=cab.id ' +
            ' inner join `groups` g on sch.group_id = g.groupId ' +
            ' inner join ktp k on sch.ktp_id = k.ktpId ' +

            ' where date>=:dateStart AND date<=:dateEnd', {
                replacements: {
                    dateStart: String(dateStart),
                    dateEnd: String(dateEnd)
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

    }

    async getWeekSchedule(date) {
        let dateEnd = moment(date).add(7, 'days').format('YYYY-MM-DD');
        return this.getScheduleOnPeriod(date, dateEnd);
    }

    async getStudyWeekSchedule(date) {
        let dates = this.getStudyWeek();
        return this.getScheduleOnPeriod(dates[0], dates[1]);
    }

    getStudyWeek(date) {
        let dt = moment(this.date);
        let year = dt.year();
        if (dt.month() < 8) {
            year--;
        }
        let startDate = moment(year + '-09-01');// start week
        let diffWeeks = dt.diff(startDate, 'weeks');
        let startWeekDate = startDate.add(diffWeeks, 'w');
        let endWeekDate = startWeekDate.clone().add(6, 'd');
        return [startWeekDate.format('YYYY-MM-DD'), endWeekDate.format('YYYY-MM-DD')]
    }

    async getPrintSchedule(date) {
        return await sequelize.query(
            ' select date, ' +
            ' schedule_new.status, ' +
            ' schedule_new.event, ' +
            ' lesson_number, ' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp, ' +
            ' s.nameShort, ' +
            ' g.name, ' +
            ' c.number, ' +
            ' cab.number as optionalCabinet, ' +
            ' g.course ' +
            ' from schedule_new ' +
            ' inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            ' left join employees emp on schedule_new.optional_teacher_id = emp.employeeId ' +
            ' inner join ktp k on schedule_new.ktp_id=k.ktpId ' +
            ' inner join subjects s on k.subjectId = s.subjectId ' +
            ' inner join `groups` g on schedule_new.group_id = g.groupId ' +
            ' inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            ' left join cabinets cab on schedule_new.optional_cabinet_id=cab.id ' +
            ' where date=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async createNewLesson(lesson) {
        let result = await ScheduleModel.create({
            date: lesson.date,
            status: lesson.status,
            lesson_number: lesson.lessonNumber,
            teacher_id: lesson.teacher,
            optional_teacher_id: lesson.optionalTeacher > 0 || null,
            group_id: lesson.groupId,
            cabinet_id: lesson.cabinet,
            optional_cabinet_id: lesson.optionalCabinet > 0 || null,
            ktp_id: lesson.ktp,
        });

        return result;

        // return await sequelize.query(
        //     'insert into schedule_new(date, status,lesson_number,teacher_id,optional_teacher_id,ktp_id,group_id,cabinet_id,optional_cabinet_id)' +
        //     `values (:date,:status,:lesson,:teacher,:optional_teacher,:ktp,:group,:cabinet,:optionalCabinet)`,
        //     {
        //         replacements: {
        //             date: lesson.date,
        //             status: lesson.status,
        //             lesson: lesson.lessonNumber,
        //             teacher: lesson.teacher,
        //             optional_teacher: lesson.optionalTeacher,
        //             ktp: lesson.ktp,
        //             group: lesson.groupId,
        //             cabinet: lesson.cabinet,
        //             optionalCabinet: lesson.optionalCabinet
        //         },
        //         type: sequelize.QueryTypes.insert
        //     }
        // )
    }

    async getWeekHours(currentDate, startWeek, endWeek, groupId) {

        return await sequelize.query(
            'select count(date) as hours ' +
            'from schedule_new s ' +
            'where s.group_id=:group and ' +
            '(s.date between :start and :end ) and ' +
            's.date <> :currentDate '
            , {
                replacements: {
                    currentDate: String(currentDate),
                    start: String(startWeek),
                    end: String(endWeek),
                    group: groupId,

                },
                type: sequelize.QueryTypes.update

            }
        )
    }

    async getLessonId() {
        return await sequelize.query(
            'select max(id) as id from schedule_new', {
                type: sequelize.QueryTypes.select
            }
        )
    }

    async updateSchedule(lesson) {
        console.log(lesson)
        return await ScheduleModel.update({
                date: lesson.date,
                status: lesson.status,
                lesson_number: lesson.lessonNumber,
                teacher_id: lesson.teacher,
                optional_teacher_id: lesson.optionalTeacher > 0 || null,
                group_id: lesson.groupId,
                cabinet_id: lesson.cabinet,
                optional_cabinet_id: lesson.optionalCabinet > 0 || null,
                ktp_id: lesson.ktp,
            },
            {
                where: {id: lesson.id}
            });
    }

    async deleteSchedule(lessonId) {
        return await sequelize.query(
            'delete from schedule_new where id=:id', {
                replacements: {id: lessonId},
            }
        )
    }
}

module.exports = new ScheduleService()