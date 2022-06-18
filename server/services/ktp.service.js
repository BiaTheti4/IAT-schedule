const sequelize = require("../models");
const moment = require('moment');

const GROUP_FULL_TIME = 1;
const GROUP_REMOTE_TIME = 2;
const DO_SPEC_ID = 18;

const PRACTICE_CODES = {
    1: 'УП',
    2: 'ПП',
};

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
        let eduYear = this.currentYear(date);
        let data = await sequelize.query(
            'select s.nameShort, s.subjectId, k.ktpId, k.employeeId,k.group_employee,k.group_k_employee,k.grouped,k.grouped_k, k.semester,k.groupId, ' +
            '(select week from curriculum_course_split as ccs inner join curriculum c on ccs.curriculumId = c.id where c.specId = g.specId and c.year = k.year and c.learning_type = g.type and ccs.course = ceil(k.semester / 2) limit 1) as split_week, ' +
            'cp.type as practice_type, if(cs.id > 0, cs.code, sm.code) as subject_code ' +
            'from subjects s ' +
            'inner join ktp k on s.subjectId = k.subjectId ' +
            'inner join groups g on g.groupId = k.groupId ' +
            'left join curriculum_subjects cs on k.curriculumSubjectId = cs.id ' +
            'left join curriculum_module_practice cp on k.curriculumPracticeId = cp.id ' +
            'left join standard_modules sm on cp.moduleId = sm.id ' +
            'where k.year=:date and k.committed=1 and g.type=:groupType and g.specId!=:doSpecId ' +
            'group by k.ktpId', {
                replacements: {
                    doSpecId: DO_SPEC_ID,
                    groupType: GROUP_FULL_TIME,
                    date: eduYear
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = {};
        let weekNumber = this.getWeekNumber(date);
        data.forEach(function (row) {
            if ((weekNumber < row.split_week && row.semester % 2 == 0) ||
                (weekNumber >= row.split_week && row.semester % 2 !== 0)
            ) {
                //skip
                return;
            }
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
            if (!result[row.groupId]) {
                result[row.groupId] = {
                    course: Math.ceil(row.semester / 2),
                    groupId: row.groupId,
                    subjects: [],
                };
            }
            let name = '';
            if (row.practice_type > 0) {
                name = PRACTICE_CODES[row.practice_type] + '.' +
                    (row.subject_code < 10 ? '0' : '') + row.subject_code +
                    ' ' + row.nameShort;
            } else {
                name = row.subject_code + ' ' + row.nameShort;
            }
            result[row.groupId].subjects.push({
                nameShort: name,
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

    async getEmployees() {
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
        return result;
    }


    getWeekNumber(date) {
        let dt = moment(date);
        let year = dt.year();
        if (dt.month() < 8) {
            year--;
        }
        let startDate = moment(year + '-09-01');// start week
        return dt.diff(startDate, 'weeks');

    }
}

module.exports = new KtpService()