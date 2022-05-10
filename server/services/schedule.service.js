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
            `values (:date,:status,:event,:lesson,:teacher,:optional_teacher,:subject,:group,:cabinet)`,
            {
                replacements: {
                    date:date,
                    status:status,
                    event:event,
                    lesson:lesson_number,
                    teacher:teacher_id,
                    optional_teacher:optional_teacher_id,
                    subject:subject_id,
                    group:group_id,
                    cabinet:cabinet_id
                }
            }
        )
    }
    async updateSchedule({status,event,lesson_number,teacher_id,optional_teacher_id,subject_id,group_id,cabinet_id,id}){
        return await sequelize.query(
            'update schedule_new set status=:status,event=:event,lesson_number=:lesson,teacher_id=:teacher,optional_teacher_id=:optional_teacher,subject_id=:subject,group_id=:group,cabinet_id=:cabinet where id=:id',{
                replacements:{
                    status:status,
                    event:event,
                    lesson:lesson_number,
                    teacher:teacher_id,
                    optional_teacher:optional_teacher_id,
                    subject:subject_id,
                    group:group_id,
                    cabinet:cabinet_id,
                    id:id
                }
            }
        )
    }
}

module.exports = new ScheduleService()