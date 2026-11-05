const {test} = require('node:test');
const assert = require('node:assert/strict');
const {distribute, buildReport} = require('../services/hours-control.calculation');
test('80 hours over 14 weeks preserves hours and pairs', () => {
    const result = distribute(80, 14);
    assert.equal(result.reduce((a, b) => a + b, 0), 80);
    assert.equal(result.filter(h => h === 6).length, 12);
    assert.equal(result.filter(h => h === 4).length, 2);
    assert.deepEqual(distribute(0, 0), []);
    assert.equal(distribute(5, 3).reduce((a,b) => a+b,0), 5);
});
function fixture() {
    return {plans: [{ktpId: 1, curriculumId: 1, semester: 1, split_week: 3, employeeId: 7}],
        weeks: [1,2,3].map(week => ({curriculumId: 1, course: 1, week, type: 1})),
        lessons: Array.from({length: 180}, () => ({ktp_id: 1, category: 't', date: null})), employees: []};
}
test('180 hours cannot fit into two six-day weeks (168 hours)', () => {
    const report = buildReport(fixture(), '2026-08-31', 2026);
    assert.equal(report.subjects[0].weeks, 2);
    assert.equal(report.teachers[0].checks[0].capacity, 168);
    assert.equal(report.teachers[0].checks[0].deficit, 12);
    assert.equal(report.teachers[0].alarm, true);
});
test('holidays are excluded and future scheduled hours remain in load', () => {
    const data = fixture(); data.weeks[1].type = 8;
    data.lessons[0].date = '2026-09-01';
    data.lessons[1].date = '2026-09-03';
    const report = buildReport(data, '2026-09-01', 2026);
    assert.equal(report.subjects[0].delivered, 1);
    assert.equal(report.subjects[0].remaining, 179);
    assert.equal(report.subjects[0].weeks, 1);
    assert.equal(report.teachers[0].remaining, 179);
});
test('teacher days are not multiplied by groups; second teachers get load', () => {
    const data = fixture();
    data.plans[0].grouped = 1; data.plans[0].group_employee = 8;
    data.lessons.forEach(l => l.category = 'p');
    data.plans.push({...data.plans[0], ktpId: 2});
    data.lessons.push({ktp_id: 2, category: 'p'});
    const report = buildReport(data, '2026-08-31', 2026);
    assert.equal(report.teachers.length, 2);
    for (const teacher of report.teachers) {
        assert.equal(teacher.remaining, 181);
        assert.equal(teacher.checks[0].capacity, 168);
    }
});
test('missing calendar is explicit, not a reassuring zero load', () => {
    const data = fixture(); data.weeks = [];
    const report = buildReport(data, '2026-08-31', 2026);
    assert.ok(report.subjects[0].warnings.length);
    assert.equal(report.teachers[0].unknown, true);
});
test('even semester and practice use their own calendar weeks', () => {
    const data = fixture();
    data.plans[0].semester = 2;
    data.plans[0].curriculumPracticeId = 12;
    data.weeks.push({curriculumId: 1, course: 1, week: 4, type: 2, curriculum_practice_id: 12});
    data.weeks.push({curriculumId: 1, course: 1, week: 5, type: 2, curriculum_practice_id: 13});
    const report = buildReport(data, '2026-09-01', 2026);
    assert.deepEqual(report.subjects[0].timeline.map(w => w.week), [4]);
});
test('same main and subgroup teacher is counted once; replacements apply', () => {
    const data = fixture();
    Object.assign(data.plans[0], {groupId: 1, subjectId: 2, grouped: 1, group_employee: 7});
    data.lessons.forEach(l => l.category = 'p');
    data.replacements = {1: {2: {7: {p: 9}}}};
    const report = buildReport(data, '2026-08-31', 2026);
    assert.equal(report.teachers.length, 1);
    assert.equal(report.teachers[0].id, 9);
    assert.equal(report.teachers[0].remaining, 180);
});
test('practice weeks have fixed 36-hour targets and exclude ordinary subjects', () => {
    const data = fixture();
    data.weeks[0] = {...data.weeks[0], type: 2, curriculum_practice_id: 12};
    data.weeks[1] = {...data.weeks[1], type: 4, curriculum_practice_id: 13};
    data.plans.push({...data.plans[0], ktpId: 2, curriculumPracticeId: 12});
    data.plans.push({...data.plans[0], ktpId: 3, curriculumPracticeId: 13});
    data.lessons.push(...Array.from({length: 36}, () => ({ktp_id: 2, category: 'p'})));
    data.lessons.push(...Array.from({length: 40}, () => ({ktp_id: 3, category: 'p'})));
    const report = buildReport(data, '2026-09-14', 2026);
    assert.equal(report.subjects[0].weeks, 0);
    for (const subject of report.subjects.slice(1)) {
        assert.equal(subject.expected, 36);
        assert.equal(subject.average, 36);
        assert.equal(subject.timeline[0].target, 36);
        assert.equal(subject.delivered, 0);
    }
    assert.equal(report.subjects[1].remaining, 36);
    assert.ok(!report.subjects[1].warnings.some(w => w.includes('не совпадают')));
    assert.ok(report.subjects[2].warnings.some(w => w.includes('не совпадают')));
});
test('multiple practice weeks keep 36 hours each even with fewer KTP hours', () => {
    const data = fixture();
    data.plans[0].curriculumPracticeId = 12;
    data.weeks.forEach(w => Object.assign(w, {type: 2, curriculum_practice_id: 12}));
    data.lessons = Array.from({length: 60}, () => ({ktp_id: 1, category: 'p'}));
    const subject = buildReport(data, '2026-09-07', 2026).subjects[0];
    assert.deepEqual(subject.timeline.map(w => w.target), [36, 36]);
    assert.equal(subject.calendarHours, 72);
    assert.equal(subject.expected, 36);
    assert.equal(subject.delta, -36);
    assert.equal(subject.total, 60);
});
