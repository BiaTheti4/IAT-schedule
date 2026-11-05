const moment = require('moment');

// One schedule row is one academic hour. Weeks follow the existing September 1 convention.
function distribute(hours, count) {
    if (!count) return [];
    return Array.from({length: count}, (_, i) =>
        Math.min(hours, 2 * Math.ceil(hours * (i + 1) / count / 2)) -
        Math.min(hours, 2 * Math.ceil(hours * i / count / 2)));
}

function buildReport({plans, weeks, lessons, employees, replacements = {}}, date, year) {
    const start = moment(`${year}-09-01`);
    const teachers = new Map();
    const names = new Map(employees.map(e => [+e.employeeId, e.name]));
    const subjects = plans.map(plan => {
        const warnings = [];
        const courseWeeks = weeks.filter(w => +w.curriculumId === +plan.curriculumId && +w.course === Math.ceil(plan.semester / 2));
        if (!plan.split_week) warnings.push('Не задана неделя смены семестра');
        const semesterWeeks = courseWeeks.filter(w => plan.split_week && (plan.semester % 2 ? +w.week < +plan.split_week : +w.week >= +plan.split_week));
        const isPractice = +plan.curriculumPracticeId > 0;
        const eligible = semesterWeeks.filter(w => plan.curriculumPracticeId > 0
            ? [2, 4, 5].includes(+w.type) && +w.curriculum_practice_id === +plan.curriculumPracticeId
            : +w.type === 1).sort((a, b) => a.week - b.week);
        if (!eligible.length) warnings.push('Нет учебных недель для дисциплины');
        const rows = lessons.filter(l => +l.ktp_id === +plan.ktpId && l.category !== 'i');
        if (!rows.length) warnings.push('Нет часов в расписании КТП');
        const total = rows.length;
        if (total % 2) warnings.push('Нечётное число часов: последняя выдача содержит 1 час');
        const calendarHours = isPractice ? eligible.length * 36 : total;
        if (isPractice && eligible.length && total !== calendarHours) {
            warnings.push(`Часы КТП (${total}) не совпадают с графиком практики (${eligible.length} нед. × 36 = ${calendarHours} ч)`);
        }
        const targets = isPractice ? eligible.map(() => 36) : distribute(total, eligible.length);
        const timeline = eligible.map((w, i) => {
            const from = start.clone().add((w.week - 1) * 7, 'days');
            const to = from.clone().add(6, 'days');
            return {week: +w.week, start: from.format('YYYY-MM-DD'), end: to.format('YYYY-MM-DD'), target: targets[i],
                actual: rows.filter(l => l.date && l.date <= date && l.date >= from.format('YYYY-MM-DD') && l.date <= to.format('YYYY-MM-DD')).length};
        });
        const delivered = rows.filter(l => l.date && l.date <= date).length;
        const expected = timeline.filter(w => w.end <= date).reduce((sum, w) => sum + w.target, 0);
        const completedActual = rows.filter(l => l.date && l.date <= date && l.date < (timeline.find(w => w.end > date)?.start || '9999-12-31')).length;
        const remaining = total - delivered;
        const deadline = timeline.at(-1)?.end || null;
        const availableDays = new Set();
        for (const week of timeline) {
            for (let day = moment(week.start); day.format('YYYY-MM-DD') <= week.end; day.add(1, 'day')) {
                const value = day.format('YYYY-MM-DD');
                if (value > date && day.day() !== 0) availableDays.add(value);
            }
        }
        if (rows.some(l => l.date && !timeline.some(w => l.date >= w.start && l.date <= w.end))) warnings.push('Есть занятия вне учебных недель дисциплины');
        const loads = new Map();
        for (const row of rows.filter(l => !l.date || l.date > date)) {
            const category = ['p', 'l'].includes(row.category) ? 'p' : row.category === 'k' ? 'c' : 't';
            const resolve = id => replacements[plan.groupId]?.[plan.subjectId]?.[id]?.[category] || id;
            const main = row.date && row.employee_id ? row.employee_id : resolve(plan.employeeId);
            const second = category === 'p' && plan.grouped ? plan.group_employee : category === 'c' && plan.grouped_k ? plan.group_k_employee : null;
            const ids = new Set([+main, +(row.date && row.optional_employee_id ? row.optional_employee_id : resolve(second))]);
            ids.delete(0);
            for (const id of ids) loads.set(id, (loads.get(id) || 0) + 1);
        }
        for (const [id, hours] of loads) {
            if (!teachers.has(id)) teachers.set(id, {id, name: names.get(id) || String(id), tasks: []});
            teachers.get(id).tasks.push({ktpId: plan.ktpId, group: plan.groupName, subject: plan.subject, hours, deadline, days: [...availableDays]});
        }
        return {ktpId: plan.ktpId, group: plan.groupName, subject: plan.subject, semester: +plan.semester,
            total, delivered, remaining, expected, delta: completedActual - expected, weeks: timeline.length,
            average: timeline.length ? calendarHours / timeline.length : null, calendarHours, isPractice, deadline, timeline, warnings};
    });
    const teacherRows = [...teachers.values()].map(teacher => {
        const deadlines = [...new Set(teacher.tasks.map(t => t.deadline).filter(Boolean))].sort();
        const checks = deadlines.map(deadline => {
            const due = teacher.tasks.filter(t => t.deadline && t.deadline <= deadline);
            const days = new Set(due.flatMap(t => t.days));
            const remaining = due.reduce((sum, t) => sum + t.hours, 0);
            return {deadline, remaining, days: days.size, capacity: days.size * 14, deficit: Math.max(0, remaining - days.size * 14)};
        });
        return {...teacher, remaining: teacher.tasks.reduce((s, t) => s + t.hours, 0), checks,
            unknown: teacher.tasks.some(t => !t.deadline), alarm: checks.some(c => c.deficit > 0)};
    });
    return {date, year, subjects, teachers: teacherRows};
}
module.exports = {distribute, buildReport};
