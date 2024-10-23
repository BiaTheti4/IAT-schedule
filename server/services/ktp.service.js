const sequelize = require("../models");
const _ = require('lodash');
const moment = require('moment');
const ReplaceService = require('./replace.service')

const GROUP_FULL_TIME = 1;
const GROUP_REMOTE_TIME = 2;
const DO_SPEC_ID = 18;

const PRACTICE_CODES = {
    1: 'УП',
    2: 'ПП',
};
const cachedData = {};

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
                    g.specId,
                    (SELECT week
                     FROM curriculum_course_split AS ccs
                              INNER JOIN curriculum c ON ccs.curriculumId = c.id
                     WHERE c.specId = g.specId
                       AND c.year = g.year
                       AND c.learning_type = g.type
                       AND ccs.course = CEIL(k.semester / 2)
                     LIMIT 1)                                                                      AS split_week,
                    cp.type                                                                        AS practice_type,
                    IF(cs.id > 0, cs.code, sm.code)                                                AS subject_code,
                    (SELECT COUNT(id) - COUNT(date) FROM schedule AS s4 WHERE s4.ktp_id = k.ktpId) AS stayHours
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
             GROUP BY k.ktpId
             ORDER BY subject_code, s.nameShort`, {
                replacements: {
                    doSpecId: DO_SPEC_ID,
                    groupType: GROUP_FULL_TIME,
                    date: eduYear
                },
                // logging: console.log,
                type: sequelize.QueryTypes.SELECT
            }
        );
        const replaces = await ReplaceService.getReplacesOnDate(date)

        let result = {};
        let weekNumber = this.getWeekNumber(date);

        const specsShowFull = [1, 19, 2, 20];
        data.forEach(function (row) {
            if ((weekNumber < row.split_week && row.semester % 2 === 0) ||
                (weekNumber >= row.split_week && row.semester % 2 !== 0)
            ) {
                //skip
                if (!(specsShowFull.indexOf(+row.specId)!==-1 && (+row.semester === 7 || +row.semester === 8))) { // для 4 курса - отображаем все - из-за С и ТМ и ПП
                    return;
                }
            }
            let mainEmployee = _.get(replaces, [row.groupId, row.subjectId, row.employeeId, 't'], row.employeeId);
            let practiceEmployee = _.get(replaces, [row.groupId, row.subjectId, row.employeeId, 'p'], row.employeeId);
            let courseEmployee = _.get(replaces, [row.groupId, row.subjectId, row.employeeId, 'c'], row.employeeId);

            let employees = {
                theory: [mainEmployee],
                practice: [practiceEmployee],
                course: [courseEmployee]
            };
            if (row.grouped && row.group_employee) {
                employees.practice.push(
                    _.get(replaces, [row.groupId, row.subjectId, row.group_employee, 'p'], row.group_employee));
            }
            if (row.grouped_k && row.group_k_employee) {
                employees.course.push(_.get(replaces, [row.groupId, row.subjectId, row.group_k_employee, 'p'], row.group_k_employee));
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
                stayHours: row.stayHours,
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
        const activeYear = this.getActiveYear();
        let data = await sequelize.query(
            `SELECT DISTINCT e.employeeId,
                CONCAT(e.last_name, ' ', SUBSTR(e.first_name, 1, 1), '.',
                       SUBSTR(e.fathers_name, 1, 1), '.') AS fio
FROM employees AS e
         INNER JOIN employee_loading_subjects els
         ON e.employeeId IN (els.courseEmployeeId, els.employeeId, els.practiceEmployeeId)
         INNER JOIN employee_loading el ON els.employeeLoadingId = el.id
WHERE el.year = :year

UNION

SELECT DISTINCT e.employeeId,
                CONCAT(e.last_name, ' ', SUBSTR(e.first_name, 1, 1), '.',
                       SUBSTR(e.fathers_name, 1, 1), '.') AS fio
FROM employees AS e
         INNER JOIN teacher_replace tr ON e.employeeId = tr.replaceEmployeeId
WHERE (dateStart BETWEEN :dateStart AND :dateEnd
   OR dateEnd BETWEEN :dateStart AND :dateEnd)

UNION

SELECT DISTINCT e.employeeId,
                CONCAT(e.last_name, ' ', SUBSTR(e.first_name, 1, 1), '.',
                       SUBSTR(e.fathers_name, 1, 1), '.') AS fio
FROM employees e
         INNER JOIN employee_contracts ec ON e.employeeId = ec.employeeId
         INNER JOIN posts p ON p.postId = ec.contractPostId
         where p.isTeacher =1 and ec.status =3
GROUP BY e.employeeId
ORDER BY fio;
`,
            {
                replacements: {
                    year: activeYear,
                    dateStart: activeYear + '-09-01',
                    dateEnd: (activeYear + 1) + '-08-01'
                },
                type: sequelize.QueryTypes.SELECT
            }
        );
        let result = [];
        data.forEach(function (row) {
            result.push({id: row.employeeId, name: row.fio});
        });
        result.push({id: 140, name: 'Пролыгина В.А.'})
        return result;
    }


    getWeekNumber(date) {
        let dt = moment(date);
        let year = this.getActiveYear(date);
        let startDate = moment(year + '-09-01');// start week
        return dt.diff(startDate, 'weeks') + 1;
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

            return `${group.name} - ${curriculumSubject.code} ${subject.name} (ID: ${ktpRow.ktpId})`;
        } else if (ktpRow.curriculumPracticeId > 0) {
            let subject = await ktpRow.getSubject();
            let group = await ktpRow.getGroup();

            return `${group.name} - ${subject.name} (ID: ${ktpRow.ktpId})`;
        }

        return '';
    }

    async getKtpInfo(ktpId) {

        let cached = _.get(cachedData, ['getEmployees', ktpId], false);
        if (cached) {
            return cached;
        }
        const {ktp} = sequelize.models
        let ktpRow = await ktp.findByPk(ktpId);

        if (!ktpRow) {
            return false;
        }

        cached = {
            group: ktpRow.groupId,
            subject: ktpRow.subjectId,
            employees: {
                main: ktpRow.employeeId,
                practice: ktpRow.grouped ? ktpRow.group_employee : false,
                course: ktpRow.grouped_k ? ktpRow.group_k_employee : false,
            }
        };
        _.set(cachedData, ['getEmployees', ktpId], cached);
        return cached;
    }
}

module.exports = new KtpService()