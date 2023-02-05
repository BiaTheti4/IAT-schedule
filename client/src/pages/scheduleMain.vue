<template>
  <div>
    <form>
      <div class="flex" id="content">
        <div class="w-64 flex-initial">
          <Datepicker
              :modelValue="date"
              locale="ru-RU"
              :enableTimePicker="false"
              :disabledWeekDays="[0]"
              position="left"
              format="dd.MM.yyyy"
              :autoApply="true"
              :clearable="false"
              @update:modelValue="changeDate"
          />
        </div>
        <div class="datePickerChild">
          <select class="button-6" v-model="selectedCourse">
            <option v-for="n in 5" :value="n">{{ n }} курс</option>
          </select>
        </div>
        <div class="p-2">
          <a href="#" @click="cloneFromPrev()" class="btn btn-blue">Клонировать с предыдущей недели</a>
        </div>
      </div>
    </form>
    <br>
    <table class="table">
      <thead>
      <tr>
        <th class="w-4">#</th>
        <th class="w-4">Пара</th>
        <th v-for="group in getCourses(selectedCourse)" :key="group.groupId">
          <div class="thGroup w-32">
            <div> {{ group.name }}</div>
          </div>
        </th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="lessonNumber in 7" :key="lessonNumber.value">
        <td class="lessonNumber">{{ lessonNumber }}</td>
        <td class="lessonNumber">{{ lessonTime[lessonNumber - 1] }}</td>
        <td v-for="group in getCourseData" :class="cellInfo(group[lessonNumber])">
          <div class="formSubjects">
            <div v-if="group[lessonNumber].ktpId" style="float:left">{{ getLabel(group[lessonNumber]) }}</div>

            <select class="selectdiv"
                    v-model="group[lessonNumber].ktpId"
                    @change="performSubjectChange(group[lessonNumber]);setEmptyByKtp(group[lessonNumber],lessonNumber);"
            >
              <option value="" selected>-нет-</option>
              <option v-for="subject in getSubjectList(group[lessonNumber].groupId)" :key="subject.ktpId"
                      :value="subject.ktpId"
                      :disabled="+subject.stayHours===0"
                      :class="subjectOptionClass(subject)"
              >
                {{ subject.nameShort }}
                <template v-if="!isNaN(subject.ktpId)">({{ (subject.stayHours) }})</template>
              </option>
            </select>

            <template v-if="group[lessonNumber].ktpId">
              <select :class="hasConflictTeacher(group[lessonNumber].teacherId,lessonNumber)"
                      @change="performSubjectChange(group[lessonNumber]);"
                      v-model="group[lessonNumber].teacherId"
              >
                <option value="" disabled selected>-преподаватель-</option>
                <option v-for="employeeId in getLessonEmployees(group[lessonNumber])"
                        :value="employeeId">
                  {{ teacherPairs[employeeId] }}
                </option>
              </select>


              <select v-model="group[lessonNumber].optionalTeacherId"
                      v-if="group[lessonNumber].needSubgroup"
                      @change="performSubjectChange(group[lessonNumber]);"
                      :class="hasConflictTeacher(group[lessonNumber].optionalTeacherId,lessonNumber)"
              >
                <option value="" disabled selected>-второй преподаватель-</option>
                <option :value="null">-нет-</option>
                <option v-for="employeeId in getLessonEmployees(group[lessonNumber])"
                        :value="employeeId">
                  {{ teacherPairs[employeeId] }}
                </option>
              </select>

              <select class="selectdiv"
                      @change="performSubjectChange(group[lessonNumber]);"
                      :class="hasConflictCabinet(group[lessonNumber].cabinetId,lessonNumber)"
                      v-model="group[lessonNumber].cabinetId">
                <option value="" disabled selected>-кабинет-</option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <select class="selectdiv" @change="performSubjectChange(group[lessonNumber]);"
                      :class="hasConflictCabinet(group[lessonNumber].optionalCabinetId,lessonNumber)"
                      v-model="group[lessonNumber].optionalCabinetId">

                <option value="" disabled selected>-второй кабинет-</option>
                <option :value="null"
                        v-if="!group[lessonNumber].needSubgroup"
                >-нет-
                </option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <div class="distant" v-if="false">
                <div>дистант
                  <input type="checkbox" v-model="group[lessonNumber].status"></div>
              </div>

            </template>
          </div>
        </td>
      </tr>
      </tbody>
      <tfoot>
      <tr>
        <td colspan="2">
          Нагрузка (час):
        </td>
        <td v-for="group in getCourses(selectedCourse)" :key="group" :class="warnHours(group)">
          {{ group.hours + group.otherDayHours }}
        </td>
      </tr>
      </tfoot>
    </table>
    <button class="button-7" @click="openModal()">Сохранить</button>
    <modal-component v-if="this.modal===1" @result="modalResult"></modal-component>


    <div class="alertBlocks">
      <span class="alert" v-for="conflict in conflicts.details">
        <span class="sign">!</span><strong>{{ conflict }}</strong>
    </span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import moment from 'moment';
import _ from 'lodash';
import {createToaster} from "@meforma/vue-toaster";
import ModalComponent from "@/components/modalComponent";

import TeacherMixin from './../mixins/teachers.mixin'
import CabinetsMixin from "@/mixins/cabinets.mixin";
import LessonTime from "@/enums/LessonTime";
import {CustomLesson} from "@/enums/CustomLesson";


const toaster = createToaster({
  position: "top-right",
  duration: 3942,
  max: 1,
  pauseOnHover: false
});
export default {
  name: 'scheduleMain',
  mixins: [TeacherMixin, CabinetsMixin],
  components: {
    ModalComponent,
  },
  data() {
    return {
      lessonTime: LessonTime,
      modal: 0,
      changed: 'changed',
      usual: 'usual',
      date: moment().format('YYYY-MM-DD'),
      selectedCourse: '',
      conflicts: {
        teachers: {},
        cabinets: {},
        details: []
      },
      dateCourseEvent: {},
      removeSchedule: [],
      courses: {
        1: {groups: {}},
        2: {groups: {}},
        3: {groups: {}},
        4: {groups: {}},
        5: {groups: {}},
      },
      featureSchedule: {}
    }
  },
  computed: {
    getCourseData() {
      return _.sortBy(this.getCourses(this.selectedCourse), ['name']).map(row => this.dateCourseEvent[this.selectedCourse][row.groupId]);
    }
  },
  methods: {
    cloneFromPrev() {
      if (!confirm('Заполнить с предыдущей недели?')) {
        return false;
      }
      this.showLoading();
      this.$axios.get('schedule/clone', {
        params: {
          from_date: moment(this.date).subtract(1, 'week').format('YYYY-MM-DD'),
          to_date: moment(this.date).format('YYYY-MM-DD'),
          course: this.selectedCourse
        }
      }).then((res) => {
        if (!res.data) {
          this.$toast.error('Ошибка выполнения запроса');
          this.hideLoading();
          return;
        }

        if (res.data && res.data.status === false) {
          toaster.warning(res.data.error || 'Ошибка при клонировании.')
        }
        console.log(res.data);
        this.hideLoading();
        this.changeDate(this.date);
      })

    },
    subjectOptionClass(subject) {
      return {
        'bg-red-600': +subject.stayHours === 0,
        'text-white': +subject.stayHours === 0
      }
    },
    modalResult(commit) {
      this.modal = 0;
      if (+commit === 1) {
        this.saveSchedule();
      }
    },
    setEmptyByKtp(pair, lessonNumber) {
      if (pair.ktpId > 0) {
        let ktpRow = _.get(this.featureSchedule, pair.ktpId);
        if (!ktpRow) {
          alert('не найден КТП');
          return false;
        }
        let lastHour = false;
        for (let number = lessonNumber - 1; number >= 1; number--) {
          let row = _.get(this.dateCourseEvent, [this.selectedCourse, pair.groupId, number], false);
          if (row.ktpId > 0 && +row.ktpId === +pair.ktpId) {
            lastHour = row.lastHour;
            break;
          }
        }
        let pairIds = [];
        let index = 0;
        if (lastHour) {
          index = _.findIndex(ktpRow, (row) => +row.hour === +lastHour)
          if (index === -1) {
            alert('Не нашлись следующие темы занятий');
            return;
          }
          index++;
        }
        pairIds.push(ktpRow[index].id);
        pairIds.push(ktpRow[index + 1].id);

        let types = _.uniq([this.getTypeLabel(ktpRow[index].category), this.getTypeLabel(ktpRow[index + 1].category)]);
        let needSubgroup = false;
        pair.optionalTeacherId = '';
        if ((this.isPractice(ktpRow[index].category) || this.isPractice(ktpRow[index + 1].category)) && ktpRow[index]['practice_employee'] > 0) {
          pair.optionalTeacherId = ktpRow[index]['practice_employee']
          pair.optionalCabinetId = ktpRow[index]['cabinet_optional_need'] ?? ""
          needSubgroup = ktpRow[index]['main_employee'] !== ktpRow[index]['practice_employee'];
        }
        if ((this.isCourse(ktpRow[index].category) || this.isCourse(ktpRow[index + 1].category)) && ktpRow[index]['course_employee'] > 0) {
          needSubgroup = ktpRow[index]['main_employee'] !== ktpRow[index]['course_employee'];
          pair.optionalCabinetId = ktpRow[index]['cabinet_optional_need'] ?? ""
          pair.optionalTeacherId = ktpRow[index]['course_employee']
        }
        pair.teacherId = ktpRow[index]['main_employee'];
        pair.cabinetId = ktpRow[index]['cabinet_need'] ?? ''
        pair.needSubgroup = needSubgroup;
        pair.label = types;
        pair.ids = pairIds;
        pair.list_id = ktpRow[index + 1].list_id
        pair.lastHour = ktpRow[index + 1].hour
        pair.type = ktpRow[index + 1].list_id > 0 ? 'main' : 'custom';
      } else {
        if (pair.type === 'custom') {
          this.removeSchedule.push({id: pair.id, type: 'custom'})
        }
        pair.teacherId = ''
        pair.optionalTeacherId = ''
        pair.cabinetId = ''
        pair.optionalCabinetId = ''
        pair.label = '';
        pair.needSubgroup = false;
        pair.lastHour = null;
        // pair.ids = []; // need to stay - for save
        pair.list_id = '';
      }
    },
    isTheory(type) {
      return type === 't' || type === 'c' || type === 's';
    },
    isPractice(type) {
      return type === 'l' || type === 'p';
    },
    isCourse(type) {
      return type === 'k';
    },
    getLabel(scheduleRow) {
      let labels = scheduleRow.label;
      if (_.isArray(labels)) {
        return labels.join('/');
      }
      return '';
    },
    getTypeLabel(type) {
      if (this.isTheory(type)) {
        return 'Т';
      } else if (this.isPractice(type)) {
        return 'П';
      } else if (this.isCourse(type)) {
        return 'КП';
      }
      return type;
    },
    openModal() {
      if (this.conflicts.details.length > 0) {
        this.modal = 1;
      } else {
        this.saveSchedule();
      }
    },
    correct() {
      _.each(this.dateCourseEvent, (course) => {
        _.each(course, (group) => {
          _.each(group, (lesson, key) => {
            if (lesson.ktpId > 0) {
              lesson.isChanged = 1;
            }
          })
        })
      })
    },
    changeDate(date) {
      if (date === undefined) {
        date = new Date();
      }
      let dateString = moment(date).format('YYYY-MM-DD');
      if (this.date !== dateString) {
        let changes = this.getChanges();
        if (changes.length > 0) {
          if (!confirm('Вы внесли изменения и не сохранили расписание. Смена даты откатит все изменения. Продолжить?')) {
            return;
          }
          for (let row of changes) {
            row.isChanged = false;
          }
        }
      }
      this.date = dateString;
      this.getSubjects();
      this.UpdateDateCourseEvent();
    },
    performSubjectChange(lesson) {
      lesson.isChanged = 1;
      if (!lesson.ktpId > 0) this.setEmpty(lesson)

      this.checkConflict();

    },
    checkConflict() {
      let conflict = {
        teachers: {},
        cabinets: {},
        details: []
      };

      const ignoreCabinets = [
        62,// Дистанта
      ];
      const ignoreSubjects = [
        212, // Производственная практика
      ];

      _.each(this.dateCourseEvent, (courses, courseNum) => {
        _.each(courses, (groups, groupId) => {
          let groupRow = this.courses[courseNum].groups[groupId]
          groupRow.hours = 0;
          _.each(groups, (pair, pairNum) => {
            if (pair.ktpId > 0) {
              groupRow.hours += 2;// add current hours on day to all part
              let key;

              if (ignoreSubjects.indexOf(pair.subjectId) !== -1) {
                return;
              }
              if (pair.teacherId) {
                key = pair.teacherId + '_' + pairNum;
                if (!conflict.teachers[key]) {
                  conflict.teachers[key] = [];
                }
                conflict.teachers[key].push(pair);
              }
              if (pair.optionalTeacherId > 0 && pair.teacherId !== pair.optionalTeacherId) {
                key = pair.optionalTeacherId + '_' + pairNum;
                if (!conflict.teachers[key]) {
                  conflict.teachers[key] = [];
                }
                conflict.teachers[key].push(pair);
              }
              // cabinets
              if (pair.cabinetId > 0 && ignoreCabinets.indexOf(+pair.cabinetId) === -1) {
                key = pair.cabinetId + '_' + pairNum;
                if (!conflict.cabinets[key]) {
                  conflict.cabinets[key] = [];
                }
                conflict.cabinets[key].push(pair);
              }
              if (pair.optionalCabinetId > 0 && pair.cabinetId !== pair.optionalCabinetId
                  && ignoreCabinets.indexOf(+pair.optionalCabinetId) === -1
              ) {
                key = pair.optionalCabinetId + '_' + pairNum;
                if (!conflict.cabinets[key]) {
                  conflict.cabinets[key] = [];
                }
                conflict.cabinets[key].push(pair);
              }
            }
          })
        })
      })

      _.each(conflict.teachers, (teachers, key) => {
        if (teachers.length > 1) {
          let groups = teachers.map(item => item.group).join(', ')
          let teacherName = this.teacherPairs[_.split(String(key), '_', 1)[0]]
          let lessonNumber = _.split(String(key), '_')[1]
          let detail = `Пара ${lessonNumber} Преподаватель: ${teacherName} в группах: ${groups}`
          conflict.details.push(detail)
        }
      })
      _.each(conflict.cabinets, (cabinets, key) => {
        if (cabinets.length > 1) {
          let cabinetId = _.split(String(key), '_', 1)[0]
          let lessonNumber = _.split(String(key), '_')[1]

          let groups = cabinets.map(item => item.group).join(', ')
          let cabinetNumber = (_.find(this.cabinets, (item) => +item.id === +cabinetId)).number
          let detail = `Пара ${lessonNumber} Кабинет: ${cabinetNumber} в группах:  ${groups}`
          conflict.details.push(detail)
        }

      })
      this.conflicts = conflict;
    },
    getLessonEmployees(lessonData) {
      if (isNaN(lessonData.ktpId)) {
        return _.map(_.sortBy(_.toPairs(this.teacherPairs), 1), (row) => row[0])
      }

      let row = _.get(this.courses, [this.selectedCourse, 'groups', lessonData.groupId], false);
      if (!row) {
        return [];
      }
      let subject = _.find(row.subjects, (subject) => +subject.ktpId === +lessonData.ktpId);
      return subject ? subject.employees.practice : [];
    },
    getWeekHours() {
      let courses = this.courses;
      this.showLoading();
      this.$axios.get('schedule/getWeekHours', {
        params: {date: this.date}
      }).then((res) => {
        if (!res.data) {
          this.$toast.error('Ошибка выполнения запроса');
          this.hideLoading();
          return;
        }
        let data = res.data;
        let currentDate = moment(this.date).format('YYYY-MM-DD');
        _.each(courses, (courseGroups) => {
          _.each(courseGroups.groups, (group) => {
            let hours = _.get(data, [group.groupId, 'hours'], {});
            let hoursCount = 0;
            _.each(hours, (hour, day) => {
              hoursCount += (day !== currentDate ? hour : 0);
            });
            group.otherDayHours = hoursCount;

          })
        })
        this.hideLoading();
      });
    },

    getCourses(course) {
      let groups = [];
      switch (Number(course)) {
        case 1:
          groups = this.courses[1].groups;
          break;
        case 2:
          groups = this.courses[2].groups;
          break;
        case 3:
          groups = this.courses[3].groups;
          break;
        case 4:
          groups = this.courses[4].groups;
          break;
        default:
          groups = this.courses[5].groups;
          break;
      }
      return _.sortBy(groups, ['name']);
    },
    getSubjects() {
      let courses = this.courses;
      this.showLoading();

      this.$axios.get('ktp/getSubjects', {
        params: {date: this.date}
      }).then((res) => {
        if (!res.data) {
          this.$toast.error('Ошибка выполнения запроса');
          this.hideLoading();
          return;
        }

        _.each(res.data, (group) => {
          if (_.get(courses, [group.course, 'groups', group.groupId], false)) {
            courses[group.course].groups[group.groupId].subjects = group.subjects
          }
        })
        this.hideLoading();
      })
    },
    setEmpty(lesson) {
      lesson.cabinet = ''
      lesson.cabinetId = ''
      lesson.optionalCabinet = ''
      lesson.optionalCabinetId = ''
      lesson.teacher = ''
      lesson.teacherId = ''
      lesson.optionalTeacher = ''
      lesson.optionalTeacherId = ''
      lesson.status = ''
    },

    // в test лежит название группы
    getSubjectList(groupId) {
      let ktpSubjects = _.get(this.courses, [this.selectedCourse, 'groups', groupId, 'subjects'], [])
      return [...ktpSubjects, ...CustomLesson];
    },
    UpdateDateCourseEvent() {
      this.showLoading();
      _.each(this.dateCourseEvent, (course) => {
        _.each(course, (group) => {
          _.each(group, (lesson) => {
            let elem = lesson
            elem.subject = ''
            elem.ktpId = ''
            elem.subjectId = ''
            elem.teacher = ''
            elem.teacherId = ''
            elem.optionalTeacher = ''
            elem.optionalTeacherId = ''
            elem.cabinetId = ''
            elem.cabinet = ''
            elem.optionalCabinetId = ''
            elem.optionalCabinet = ''
            elem.status = 0
            elem.id = 0
            elem.changed = 0
          })
        })
      })

      this.conflicts.cabinets = {}
      this.conflicts.details = []
      this.conflicts.teachers = {}

      this.$axios.get('schedule/getCurrentSchedule', {
        params: {date: this.date}
      }).then((res) => {
        if (!res.data) {
          this.$toast.error('Ошибка выполнения запроса');
          this.hideLoading();
          return;
        }


        _.each(res.data.current, (row) => {
          let element = _.get(this.dateCourseEvent, [row.course, row.groupId, row.lesson_number], false);
          if (element) {
            element.id = row.id;
            element.ids = row.ids;
            element.ktpId = row.ktpId;
            element.teacherId = row.teacherId;
            element.needSubgroup = row.needSubgroup;
            element.optionalTeacherId = row.optionalTeacherId;
            element.cabinetId = row.cabinetId;
            element.subjectId = row.subjectId;
            element.label = _.uniq([...row.categories.map((category) => this.getTypeLabel(category))]);
            element.optionalCabinetId = row.optionalCabinetId;
            element.isChanged = false;
            element.type = 'main';
          }
        })
        // add custom schedule
        _.each(res.data.custom, (row) => {
          let element = _.get(this.dateCourseEvent, [row.course, row.group_id, row.lesson_number], false);
          if (element) {
            element.id = row.id;
            element.ktpId = row.name;
            element.teacherId = row.employee_id;
            element.cabinetId = row.cabinet_id;
            element.isChanged = false;
            element.type = 'custom';
          }
        });

        this.featureSchedule = res.data.feature;
        this.checkConflict();
        this.getWeekHours();
        this.hideLoading();
      })
    },
    initDateCourseEvent() {
      this.dateCourseEvent = {}
      for (let k = 1; k < 6; k++) {
        this.dateCourseEvent[k] = {}
        let groups = this.getCourses(k)
        _.each(groups, (group) => {
          this.dateCourseEvent[k][group.groupId] = {}
          for (let j = 1; j < 8; j++) {
            this.dateCourseEvent[k][group.groupId][j] = {
              group: group.name,
              groupId: group.groupId,
              // subject: '',
              subjectId: null,
              ktpId: null,
              customText: '',
              teacherId: null,
              optionalTeacherId: null,
              cabinetId: null,
              optionalCabinetId: null,
              // teacher: '',
              // optionalTeacher: '',
              // cabinet: '',
              // optionalCabinet: '',
              status: false,
              label: '',
              needSubgroup: false,
              error: [],
            }
          }
        })
      }
    },
    warnHours(group) {
      let sum = group.hours + group.otherDayHours
      if (sum < 36) {
        return {'tooLow': true}
      } else if (sum === 36) {
        return {'normal': true}
      } else {
        return {'tooMuch': true}
      }
    },
    hasConflictTeacher(teacherId, pair) {
      return {
        'selectdiv': true,
        'conflict': _.get(this.conflicts, ['teachers', teacherId + '_' + pair], 0).length > 1,
      }
    },
    hasConflictCabinet(cabinetId, pair) {
      return {
        'selectdiv': true,
        'conflict': _.get(this.conflicts, ['cabinets', cabinetId + '_' + pair], 0).length > 1,
      }
    },
    cellInfo(pair) {
      if (pair.ktpId > 0 && (!(pair.cabinetId > 0) || !(pair.teacherId > 0))) {
        return {'notFullForm': true}
      }
      if (pair.isChanged === 1) {
        return {'changed': true}
      }
      if (pair.ktpId > 0) {
        return {'usual': true}
      }

    },
    getChanges() {
      let updateData = [];
      _.each(this.dateCourseEvent, (course) => {
        _.each(course, (group) => {
          _.each(group, (lesson, key) => {
            if (lesson.isChanged > 0) {
              lesson.date = this.date;
              lesson.lesson_number = key;
              updateData.push(lesson);
            }
          })
        })
      })
      return updateData;
    },
    saveSchedule() {
      let updateData = this.getChanges();
      if (updateData.length) {
        this.$axios.post('schedule/updateSchedule', {
          data: updateData,
          remove: this.removeSchedule,
          date: this.date
        }).then((res) => {
          if (!res.data) {
            this.$toast.error('Ошибка выполнения запроса');
            this.hideLoading();
            return;
          }

          this.removeSchedule = [];
          if (res.data.status === true) {
            toaster.success('Расписание сохранено')
            for (let lesson of updateData) {
              lesson.isChanged = false;
            }
            this.getSubjects();
            this.UpdateDateCourseEvent();
          } else {
            toaster.error(res.data.errors.join(', '))
          }
          this.hideLoading();
        }).catch((res) => {
          toaster.success(res)
          this.hideLoading();
        })
      } else {
        toaster.success('Нечего сохранять')
      }

    },

    initGroups() {
      this.showLoading();
      this.$axios.get('groups/all').then((res) => {
        if (!res.data) {
          this.$toast.error('Ошибка выполнения запроса');
          this.hideLoading();
          return;
        }

        for (let i = 0; i < res.data.length; i++) {
              let gr = res.data[i]
              this.courses[gr.course].groups[gr.groupId] = {...gr, subjects: [], hours: 0};
            }

            this.initDateCourseEvent();
            this.changeDate();
            this.hideLoading();

          }
      )
    }
  },
  mounted() {
    this.selectedCourse = '1';

    this.initEmployees();
    this.initCabinets();
    this.initGroups();

    //установка текущего курса по умолчанию на 1
    //запросы на получение информации

  }
}
</script>

<style scoped>
.changed {
  @apply bg-orange-100
  /*border-radius: 10px;*/
  /*background: #ffe3c5;*/
}

.tooLow {
  @apply bg-orange-300 text-orange-900 text-center;
}

.normal {
  @apply bg-green-200 text-green-900 text-center;
}

.tooMuch {
  @apply bg-red-200 text-red-900 text-center;
}

.table tbody td {
  @apply p-2;

}

.alertBlocks {
  @apply flex flex-col mt-4;
  /*display: flex;*/
  /*flex-direction: column;*/
  /*margin-top: 35px;*/
}

.alert {
  @apply bg-red-500 text-white border border-r-4 flex flex-row text-xl my-6
}

.sign {
  font-size: 40px;
  color: white;
  margin-right: 15px;
}

.tooltip {
  position: relative;
  display: inline-block;

  margin-left: 10px;
  font-size: 40px;
  color: #c82829;
  border: none;
  margin-bottom: 0px;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: auto;
  background-color: #0095ff;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 5px;
  font-size: 20px;
  text-decoration: none;


  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  bottom: 100%;
  left: 50%;
  margin-left: -60px;
}


.closebtn {
  margin-left: 15px;
  color: white;
  font-weight: bold;
  float: right;
  font-size: 22px;
  line-height: 20px;
  cursor: pointer;
  transition: 0.3s;
}

.tooltip .tooltiptext > span {
  display: block;
}

.tooltip .tooltiptext > span + span {
  border-top: white solid 2px;
  text-decoration: none;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}

.button-6 {
  align-items: center;
  background-color: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: .25rem;
  box-shadow: rgba(0, 0, 0, 0.02) 0 1px 3px 0;
  box-sizing: border-box;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  display: inline-flex;
  font-family: system-ui, -apple-system, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  justify-content: center;
  line-height: 1.25;
  min-height: 2.5rem;
  padding-left: 5px;
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: auto;
  margin: 0 0 0 10px;
}

.button-6:hover,
.button-6:focus {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;
  color: rgba(0, 0, 0, 0.65);
}

.button-6:hover {
  transform: translateY(-1px);
}

.button-6:active {
  background-color: #F0F0F1;
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: rgba(0, 0, 0, 0.06) 0 2px 4px;
  color: rgba(0, 0, 0, 0.65);
  transform: translateY(0);
}

.table {
  @apply table-fixed
}

.table thead th {
  @apply font-bold text-center bg-sky-200 border border-slate-400;
}

.table tbody td {
  @apply border border-slate-400 p-1 m-0 text-xs align-top h-20 font-thin;
}

.table tbody tr:nth-child(even) {
  @apply bg-gray-50;
}

.table tbody tr:nth-child(odd) {
  @apply bg-gray-100;
}

.table tbody tr:hover {
  @apply bg-gray-200
}

.formSubjects {
  display: flex;
  flex-direction: column;
  margin: 2px;
}

.lessonNumber {
  width: 7%;
}

body {
  background: #fff;
}

.selectdiv {
  @apply w-full font-thin mb-0.5;
}


/* IE11 hide native button (thanks Matt!) */
select::-ms-expand {
  display: none;
}


/* CSS */
.button-7 {

  background-color: #0095ff;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: rgba(255, 255, 255, .4) 0 1px 0 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", "Liberation Sans", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.15385;
  margin: 0;
  margin-left: 5px;
  outline: none;
  padding: 8px .8em;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.button-7:hover,
.button-7:focus {
  background-color: #07c;
}

.button-7:focus {
  box-shadow: 0 0 0 4px rgba(0, 149, 255, .15);
}

.button-7:active {
  background-color: #0064bd;
  box-shadow: none;
}

.thGroup {
  @apply flex flex-col justify-center
}

select.conflict {
  @apply bg-red-500 text-red-50 border-red-400 border-2
  /*border-color: #ff3333;*/
  /*border-width: 2px;*/
  /*background-color: #ffcccc;*/
}


.notFullForm {
  @apply bg-red-400
}

.usual {
  @apply bg-green-100;
}

.usual:hover {
  @apply bg-green-200;
}

.btn {
  @apply font-bold py-2 px-4 rounded;
}

.btn-blue {
  @apply bg-blue-500 text-white;
}

.btn-blue:hover {
  @apply bg-blue-700;
}
</style>