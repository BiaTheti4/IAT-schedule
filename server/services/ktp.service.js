const sequelize = require("../models");
const moment = require('moment');

class KtpService {
    currentYear(date) {
        let dt = moment(date);
        let year = dt.year();
        if (dt.month() < 9) {
            year--;
        }
        return year;
    }

    async getSubjectsByGroup(group, date) {
        console.log(group, date);
        let data = await sequelize.query(
            'select s.nameShort, s.subjectId, k.ktpId, k.employeeId,k.group_employee,k.group_k_employee,k.grouped,k.grouped_k ' +
            'from subjects s ' +
            'inner join ktp k on s.subjectId = k.subjectId ' +
            'where k.groupId =:group ' +
            //поменять на текущую дату(когда будет свежая бд)
            'and k.year=:date group by s.name', {
                replacements: {
                    group: group,
                    date: this.currentYear(date)
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = [];
        data.forEach(function (row) {
            let employees = {
                theory: [row.employeeId],
                practice: [row.employeeId],
                course: [row.employeeId]
            };
            if (row.grouped && row.group_employee) {
                employees.practice.push(row.group_employee);
            }
            if (row.grouped_k && row.group_k_employee) {
                employees.course.push(row.group_k_employee);
            }
            result.push({
                nameShort: row.nameShort,
                ktpId: row.ktpId,
                subjectId: row.subjectId,
                employees: employees
            });
        });
        return result;
    }

    async getTeachersByKtp(subjectId, groupName) {
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
            'where ktp.subjectId=:subject and g.name=:group ' +
            'group by e.employeeId', {
                replacements: {
                    subject: subjectId,
                    group: groupName
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }

    async geEmployees() {
        let data = await sequelize.query('SELECT e.employeeId, CONCAT(e.last_name," ", SUBSTR(e.first_name, 1, 1),".",' +
            ' SUBSTR(e.fathers_name, 1, 1),".") as fio FROM employees AS e' +
            ' INNER JOIN employee_contracts AS ec ON ec.employeeId = e.employeeId AND ec.status = 3' +
            ' inner join posts p on ec.contractPostId = p.postId ' +
            'WHERE (e.status = 2) and p.isTeacher = 1',
            {
                replacements: {},
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = {};
        data.forEach(function (row) {
            console.log(row);
            result[row.employeeId] = row.fio;
        });
        console.log("geEmployees");
        console.log(result);

        return result;
    }
}

module.exports = new KtpService()