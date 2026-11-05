const sequelize = require('../models');
const ktpService = require('./ktp.service');
const {buildReport} = require('./hours-control.calculation');

async function getReport(date) {
    const year = ktpService.getActiveYear(date);
    const query = (sql, replacements = {}) => sequelize.query(sql, {replacements, type: sequelize.QueryTypes.SELECT});
    const plans = await query(`SELECT k.*, g.name AS groupName, s.name AS subject,
        COALESCE(cs.curriculumId, cp.curriculumId) AS curriculumId,
        (SELECT split.week FROM curriculum_course_split split
            WHERE split.curriculumId = COALESCE(cs.curriculumId, cp.curriculumId)
              AND split.course = CEIL(k.semester / 2)
              AND (split.groupId = k.groupId OR split.groupId IS NULL)
            ORDER BY split.groupId IS NULL, split.id DESC LIMIT 1) AS split_week
        FROM ktp k JOIN subjects s ON s.subjectId = k.subjectId
        JOIN \`groups\` g ON g.groupId = k.groupId
        LEFT JOIN curriculum_subjects cs ON cs.id = k.curriculumSubjectId
        LEFT JOIN curriculum_module_practice cp ON cp.id = k.curriculumPracticeId
        WHERE k.year = :year AND k.committed = 1 AND g.type = 1 AND g.specId != 18
        ORDER BY g.name, k.semester, s.name`, {year});
    if (!plans.length) return {date, year, subjects: [], teachers: []};
    const curriculumIds = [...new Set(plans.map(p => p.curriculumId).filter(Boolean))];
    const [weeks, lessons, employees, replacements] = await Promise.all([
        curriculumIds.length ? query('SELECT curriculumId, course, week, type, curriculum_practice_id FROM curriculum_weeks WHERE curriculumId IN (:ids)', {ids: curriculumIds}) : [],
        query(`SELECT sch.*, t.category FROM schedule sch
            LEFT JOIN ktp_list l ON l.listId = sch.list_id
            LEFT JOIN ktp_types t ON t.typeId = l.typeId WHERE sch.ktp_id IN (:ids)`, {ids: plans.map(p => p.ktpId)}),
        query("SELECT employeeId, CONCAT_WS(' ', last_name, first_name, fathers_name) AS name FROM employees"),
        require('./replace.service').getReplacesOnDate(date)
    ]);
    return buildReport({plans, weeks, lessons, employees, replacements}, date, year);
}
module.exports = {getReport};
