const {Sequelize} = require("sequelize");

class KtpService {
    async getSubjectsByGroup(req, res) {
        return await Sequelize.query(
            'select ktpId,' +
            'groupId,' +
            'employeeId,' +
            's.subjectId,' +
            'curriculumSubjectId,' +
            'group_employee,' +
            'name,' +
            'semester,' +
            'nameShort' +
            'from ktp' +
            'inner join subjects s on ktp.subjectId = s.subjectId' +
            'where groupId = 124' +
            'and year=2021;'
        );
    }

    async getTeachersByKtp(req, res) {
        return await Sequelize.query(
            'select' +
            'ktp.employeeId,' +
            'concat(e.last_name, e.first_name, e.fathers_name) as main_emp,' +
            'ktp.group_employee,' +
            'сoncat(emp.last_name, emp.first_name, emp.fathers_name) as group_emp' +
            'from ktp' +
            'inner join `employees` e on ktp.employeeId = e.employeeId' +
            'inner join `employees` emp on ktp.group_employee = emp.employeeId' +
            'where ktpId = 12565;'
        );
    }
}

module.exports = new KtpService()