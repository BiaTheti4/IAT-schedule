const sequelize = require("../models");

class ScheduleService {
    async getCurrentSchedule(date) {
        return await sequelize.query(
            'select date, course, status, lesson_number, ktp_id, cabinet_id' +
            'from schedule_new' +
            'inner join ktp k on schedule_new.ktp_id = k.ktpId' +
            'inner join cabinets c on schedule_new.cabinet_id = c.id' +
            //поменять на request.body
            'where schedule_new.date=:date', {
                replacements: {date: date},
            }
        )
    }

    async createNewLesson({date, status, event, lesson_number, teacher_id, optional_teacher_id, subject_id, group_id, cabinet_id}) {
        return await sequelize.query(
            'insert into schedule_new(date, status,event,lesson_number,teacher_id,optional_teacher_id,subject_id,group_id,cabinet_id)' +
            `values (?,?,?,?,?,?,?,?,?)`,
            {
                replacements: {
                    date:date,
                    status:status,
                    event:event,
                    lesson_number:lesson_number,
                    teacher_id:teacher_id,
                    optional_teacher_id:optional_teacher_id,
                    subject_id:subject_id,
                    group_id:group_id,
                    cabinet_id:cabinet_id
                }
            }
        )
    }


    // async updateTeacher(req, res) {
    //     return await sequelize.query(
    //
    //     )
    // }
}

module
    .exports = new ScheduleService()