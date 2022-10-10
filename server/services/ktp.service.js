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

    getActiveYear(date) {
        const dt = moment(date);
        let year = dt.year();
        if (dt.month() < 8) {
            year--;
        }
        return year;
    }


    async isNeedSecondEmployee(listId) {
        const {ktp_list} = sequelize.models
        let ktpListRow = await ktp_list.findByPk(listId)
        if (!ktpListRow) {
            return false;
        }

        let ktpType = await ktpListRow.getKtpType();
        let isPractice = this.isPractice(ktpType.category);
        let isCourse = this.isCourse(ktpType.category);

        if (isPractice || isCourse) {
            let ktpThemeRow = await ktpListRow.getTheme();
            let ktpBlockRow = await ktpThemeRow.getBlock();
            let ktpRow = await ktpBlockRow.getKtp();
            if (isPractice && ktpRow.grouped) {
                return true;
            }
            if (isCourse && ktpRow.grouped_k) {
                return true;
            }
        }
        return false;

    }

    isTheory(type) {
        return type === 't' || type === 'c' || type === 's';
    }

    isPractice(type) {
        return type === 'l' || type === 'p';
    }

    isCourse(type) {
        return type === 'k';
    }

    currentYear(date) {
        let dt = moment(date);
        let year = dt.year();
        if (dt.month() < 7) {
            year--;
        }
        return year;
    }

    async getSubjectsByGroup(group, date) {
        let eduYear = this.currentYear(date);
        let data = await sequelize.query(
            `SELECT s.nameShort,
                    s.subjectId,
                    k.ktpId,
                    k.employeeId,
                    k.group_employee,
                    k.group_k_employee,
                    k.grouped,
                    k.grouped_k,
                    k.semester,
                    k.groupId,
                    (SELECT week
                     FROM curriculum_course_split AS ccs
                              INNER JOIN curriculum c ON ccs.curriculumId = c.id
                     WHERE c.specId = g.specId
                       AND c.year = g.year
                       AND c.learning_type = g.type
                       AND ccs.course = CEIL(k.semester / 2)
                     LIMIT 1)                       AS split_week,
                    cp.type                         AS practice_type,
                    IF(cs.id > 0, cs.code, sm.code) AS subject_code
             FROM subjects s
                      INNER JOIN ktp k
                                 ON s.subjectId = k.subjectId
                      INNER JOIN \`groups\` g ON g.groupId = k.groupId
                      LEFT JOIN curriculum_subjects cs ON k.curriculumSubjectId = cs.id
                      LEFT JOIN curriculum_module_practice cp ON k.curriculumPracticeId = cp.id
                      LEFT JOIN standard_modules sm ON cp.moduleId = sm.id
             WHERE k.year = :date
               AND k.committed = 1
               AND g.type = :groupType
               AND g.specId != :doSpecId
             GROUP BY k.ktpId`, {
                replacements: {
                    doSpecId: DO_SPEC_ID,
                    groupType: GROUP_FULL_TIME,
                    date: eduYear
                },
                logging: console.log,
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = {};
        let weekNumber = this.getWeekNumber(date);
        data.forEach(function (row) {
            if ((weekNumber < row.split_week && row.semester % 2 === 0) ||
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
            let name;
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
            `SELECT ktp.employeeId,
                    CONCAT(e.last_name, ' ', LEFT(e.first_name, 1), '.', ' ', LEFT(e.fathers_name, 1), '.') AS main_emp,
                    ktp.group_employee,
                    CONCAT(emp.last_name, ' ', LEFT(emp.first_name, 1), '.', ' ', LEFT(emp.fathers_name, 1),
                           '.')                                                                             AS group_emp
             FROM ktp
                      INNER JOIN employees e ON ktp.employeeId = e.employeeId
                      LEFT JOIN employees emp ON ktp.group_employee = emp.employeeId
                      INNER JOIN \`groups\` g ON g.groupId = ktp.groupId
             WHERE ktp.subjectId = :subject
               AND g.name = :group
             GROUP BY e.employeeId`, {
                replacements: {
                    subject: subjectId,
                    group: groupName
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
    }

    async getEmployees() {
        let data = await sequelize.query(
            `SELECT DISTINCT e.employeeId,
                             CONCAT(e.last_name, ' ', SUBSTR(e.first_name, 1, 1), '.',
                                    SUBSTR(e.fathers_name, 1, 1), '.') AS fio
             FROM employees AS e
                      INNER JOIN employee_loading_subjects els ON
                     e.employeeId IN (els.courseEmployeeId, els.employeeId, els.practiceEmployeeId)
                      INNER JOIN employee_loading el ON els.employeeLoadingId = el.id
             WHERE el.year = :year
             ORDER BY last_name, first_name, fathers_name`,
            {
                replacements: {
                    year: this.getActiveYear()
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = [];
        data.forEach(function (row) {
            result.push({id: row.employeeId, name: row.fio});
        });
        return result;
    }


    getWeekNumber(date) {
        let dt = moment(date);
        let year = this.getActiveYear(date);
        let startDate = moment(year + '-09-01');// start week
        return dt.diff(startDate, 'weeks');

    }

    async geSubjectNameByKtp(ktpId) {
        const {ktp} = sequelize.models
        let ktpRow = await ktp.findByPk(ktpId);
        if (!ktpRow) {
            return '';
        }
        if (ktpRow.curriculumSubjectId > 0) {
            let curriculumSubject = await ktpRow.getCurriculumSubject();
            let subject = await curriculumSubject.getSubject();
            let group = await ktpRow.getGroup();

            return `${group.name} - ${curriculumSubject.code} ${subject.name}`;
        }

        return '';
    }
}

module.exports = new KtpService()