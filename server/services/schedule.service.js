const sequelize = require("../models");

class ScheduleService {
    async getCurrentSchedule(date) {
        return await sequelize.query(
            'select schedule_new.id,' +
            'schedule_new.date,' +
            'schedule_new.ktp_id,' +
            'g.groupId,' +
            'g.name,' +
            'g.course,' +
            'schedule_new.status,' +
            'schedule_new.event,' +
            'schedule_new.cabinet_id,' +
            'c.number, ' +
            'schedule_new.optional_cabinet_id, ' +
            'cab.number as optional_cabinet, ' +
            'schedule_new.lesson_number,' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'schedule_new.teacher_id,' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp, ' +
            'schedule_new.optional_teacher_id from schedule_new ' +
            ' inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            ' left join employees emp on schedule_new.optional_teacher_id=emp.employeeId ' +
            ' inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            ' left join cabinets cab on schedule_new.optional_cabinet_id=cab.id ' +
            ' inner join `groups` g on schedule_new.group_id = g.groupId ' +
            ' inner join ktp k on schedule_new.ktp_id = k.ktpId ' +

            ' where date=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
    }

    async getWeekSchedule(date) {
        return await sequelize.query(
            'select s.nameShort as subject_name,' +
            'c.number,' +
            'cab.number as optionalCabinet,' +
            'g.name,' +
            'date,' +
            'schedule_new.event,' +
            'schedule_new.lesson_number,' +
            'concat(e.last_name, \' \', e.first_name, \' \', e.fathers_name) as main_emp,' +
            ' concat(emp.last_name, \' \', emp.first_name, \' \', emp.fathers_name) as group_emp' +
            ' from schedule_new' +
            ' inner join employees e on schedule_new.teacher_id = e.employeeId ' +
            ' left join employees emp on schedule_new.optional_teacher_id=emp.employeeId ' +
            ' inner join cabinets c on schedule_new.cabinet_id = c.id ' +
            ' left join cabinets cab on schedule_new.optional_cabinet_id=cab.id ' +
            ' inner join `groups` g on schedule_new.group_id = g.groupId ' +
            ' inner join ktp k on schedule_new.ktp_id=k.ktpId '+
            ' inner join subjects s on k.subjectId = s.subjectId ' +
            ' where date>=:date', {
                replacements: {date: String(date)},
                type: sequelize.QueryTypes.SELECT
            }
        )
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
            ' inner join ktp k on schedule_new.ktp_id=k.ktpId '+
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

        return await sequelize.query(
            'insert into schedule_new(date, status,lesson_number,teacher_id,optional_teacher_id,ktp_id,group_id,cabinet_id,optional_cabinet_id)' +
            `values (:date,:status,:lesson,:teacher,:optional_teacher,:ktp,:group,:cabinet,:optionalCabinet)`,
            {
                replacements: {
                    date: lesson.date,
                    status: lesson.status,
                    // event: lesson.event,
                    lesson: lesson.lessonNumber,
                    teacher: lesson.teacher,
                    optional_teacher: lesson.optionalTeacher,
                    ktp: lesson.ktp,
                    group: lesson.groupId,
                    cabinet: lesson.cabinet,
                    optionalCabinet: lesson.optionalCabinet
                },
                type: sequelize.QueryTypes.insert
            }
        )
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
            'select max(id) as id from schedule_new',{
                type: sequelize.QueryTypes.select
            }
        )
    }

    async updateSchedule(lesson) {
        return await sequelize.query(
            'update schedule_new set ' +
            'status=:status,' +
            'lesson_number=:lesson,' +
            'teacher_id=:teacher,' +
            'optional_teacher_id=:optional_teacher,' +
            'ktp_id=:ktp,' +
            'group_id=:group,' +
            'cabinet_id=:cabinet ' +
            'where id=:id', {
                replacements: {
                    id: lesson.id,
                    date: lesson.date,
                    status: lesson.status,
                    // event: lesson.event,
                    lesson: lesson.lessonNumber,
                    teacher: lesson.teacher,
                    optional_teacher: lesson.optionalTeacher,
                    ktp: lesson.ktp,
                    group: lesson.groupId,
                    cabinet: lesson.cabinet
                },
                type: sequelize.QueryTypes.update

            }
        )
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