const sequelize = require("../models");

class KtpService {
    async getSubjectsByGroup(groupName) {
        const date = new Date();
        let currentYear = date.getFullYear()
        return await sequelize.query(
            'select s.nameShort,s.subjectId ' +
            'from subjects s ' +
            'inner join ktp k on s.subjectId = k.subjectId ' +
            'inner join `groups` g on k.groupId = g.groupId ' +
            'where g.name =:group ' +
            //поменять на текущую дату(когда будет свежая бд)
            'and k.year=:date group by s.name', {
                replacements: {
                    group: groupName,
                    date: '2021'
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }

    async getTeachersByKtp(subjectId,groupName) {
        console.log(subjectId)
        console.log(groupName)
        return await sequelize.query(
            'select ' +
            'ktp.employeeId, ' +
            'concat(e.last_name, \' \', left(e.first_name,1),".", \' \', left(e.fathers_name,1),".") as main_emp, ' +
            'ktp.group_employee, ' +
            'concat(emp.last_name, \' \', left(emp.first_name,1),".", \' \', left(emp.fathers_name,1),".") as group_emp ' +
            'from ktp ' +
            'inner join `employees` e on ktp.employeeId = e.employeeId ' +
            'left join `employees` emp on ktp.group_employee = emp.employeeId ' +
            'inner join `groups` g on g.groupId = ktp.groupId ' +
            'where ktp.subjectId=:subject and g.name=:group '+
            'group by e.employeeId', {
                replacements: {
                    subject: subjectId,
                    group:groupName
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }
}

module.exports = new KtpService()