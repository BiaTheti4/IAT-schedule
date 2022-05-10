const sequelize = require("../models");

class KtpService {
    async getSubjectsByGroup(groupId) {
        const date = new Date();
        let currentYear = date.getFullYear()
        return await sequelize.query(
            'select ktpId, ' +
            'groupId, ' +
            'employeeId, ' +
            's.subjectId, ' +
            'curriculumSubjectId, ' +
            'group_employee, ' +
            'name, ' +
            'semester, ' +
            'nameShort ' +
            'from ktp ' +
            'inner join subjects s on ktp.subjectId = s.subjectId ' +
            //поменять на request
            'where groupId =:group ' + +
                //поменять на текущую дату(когда будет свежая бд)
                'and year=:date', {
                replacements: {
                    group: groupId,
                    date: currentYear
                }
            }
        );
    }

    async getTeachersByKtp(ktpId) {
        return await sequelize.query(
            'select ' +
            'ktp.employeeId, ' +
            'concat(e.last_name, \' \', e.first_name, \' \', e.fathers_name) as main_emp, ' +
            'ktp.group_employee, ' +
            'concat(emp.last_name, \' \', emp.first_name, \' \', emp.fathers_name) as group_emp ' +
            'from ktp ' +
            'inner join `employees` e on ktp.employeeId = e.employeeId ' +
            'inner join `employees` emp on ktp.group_employee = emp.employeeId ' +
            //поменять на request
            'where ktpId=:ktp' +
            ' group by ktp.employeeId;', {
                replacements: {
                    ktp: ktpId
                }
            }
        );
    }
}

module.exports = new KtpService()