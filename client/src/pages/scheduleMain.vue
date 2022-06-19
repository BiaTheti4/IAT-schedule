<template>

  <div>

    <div class="datePicker" id="content">
      <form>
        <input class="button-6" type="date" @change="changeDate() " v-model="date">
        <select class="button-6" v-model="selectedCourse">
          <option v-for="n in 4" :value="n">{{ n }} курс</option>
        </select>
      </form>
    </div>
    <br>
    <table class="table">
      <thead>
      <tr>
        <th>Пара</th>
        <th v-for="group in getCourses(selectedCourse)" :key="group">
          <div class="thGroup">
            <div> {{ group.name }}</div>
          </div>
        </th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="para in 7" :key="para.value">
        <td class="lessonNumber">{{ this.lessonTime[para - 1] }}</td>
        <td v-for="(group,groupId,idx) in dateCourseEvent[selectedCourse]" :class="cellInfo(group[para])">
          <div class="formSubjects">
            <select class="selectdiv"
                    v-model="group[para].ktpId"
                    @change="performSubjectChange(group[para])"
            >
              <option value="" selected>-нет-</option>
              <option v-for="subject in getSubjectList(groupId)" :key="subject.ktpId" :value="subject.ktpId">
                {{ subject.nameShort }}
              </option>
            </select>

            <template v-if="group[para].ktpId">

              <select :class="hasConflictTeacher(group[para].teacherId,para)"
                      @change="performSubjectChange(group[para]);"
                      v-model="group[para].teacherId"
              >
                <option value="" disabled selected>-преподаватель-</option>
                <option v-for="employeeId in getLessonEmployees(group[para])"
                        :value="employeeId">
                  {{ employeePairs[employeeId] }}
                </option>
              </select>


              <select v-model="group[para].optionalTeacherId"
                      v-if="group[para].teacherId>0"
                      @change="performSubjectChange(group[para]);"
                      :class="hasConflictTeacher(group[para].optionalTeacherId,para)"
              >
                <option value="" disabled selected>-второй преподаватель-</option>
                <option :value="null"></option>
                <option v-for="employeeId in getLessonEmployees(group[para])"
                        :value="employeeId">
                  {{ employeePairs[employeeId] }}
                </option>
              </select>

              <select class="selectdiv"
                      @change="performSubjectChange(group[para]);"
                      :class="hasConflictCabinet(group[para].cabinetId,para)"
                      v-model="group[para].cabinetId">
                <option value="" disabled selected>-кабинет-</option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <select class="selectdiv" @change="performSubjectChange(group[para]);"
                      v-if="group[para].cabinetId>0"
                      :class="hasConflictCabinet(group[para].optionalCabinetId,para)"
                      v-model="group[para].optionalCabinetId">

                <option value="" disabled selected>-второй кабинет-</option>
                <option :value="null"></option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <div class="distant" v-if="false">
                <div>дистант
                  <input type="checkbox" v-model="group[para].status"></div>
              </div>

            </template>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          Нагрузка(час):
        </td>
        <td v-for="(group) in getCourses(selectedCourse)" :key="group" :class="warnHours(group)">
          {{ group.hours + group.otherDayHours }}
        </td>
      </tr>
      </tbody>
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
import modalComponent from '../components/modalComponent';
import ModalComponent from "@/components/modalComponent";

const toaster = createToaster({
  position: "top-right",
  duration: 3942,
  max: 1,
  pauseOnHover: false
});
export default {
  components: {ModalComponent},
  data() {
    return {
      modal: 0,
      changed: 'changed',
      usual: 'usual',
      employeePairs: {},
      cabinetsPairs: {},
      date: moment().format('YYYY-MM-DD'),
      selectedCourse: '',
      cabinets: [],
      conflicts: {
        teachers: {},
        cabinets: {},
        details: []
      },
      dateCourseEvent: {},
      lessonTime: [
        '08:30-10:00',
        '10:10-11:40',
        '12:10-13:40',
        '13:50-15:20',
        '15:50-17:20',
        '17:30-19:00',
        '19:10-20:40',
      ],
      courses: {
        1: {groups: {}},
        2: {groups: {}},
        3: {groups: {}},
        4: {groups: {}},
        5: {groups: {}},
      },
    }
  },
  methods: {
    modalResult(commit) {
      this.modal = 0;
      if (commit == 1) {
        this.sendPostObject();
      }
    },
    openModal() {
      if (this.conflicts.details.length > 0) {
        this.modal = 1;
      } else {
        this.sendPostObject();
      }
    },
    changeDate() {
      this.UpdateDateCourseEvent();
    },
    getStudyWeek() {
      let dt = moment(this.date);
      let year = dt.year();
      if (dt.month() < 8) {
        year--;
      }
      let startDate = moment(year + '-09-01');// start week
      let diffWeeks = dt.diff(startDate, 'weeks');
      let startWeekDate = startDate.add(diffWeeks, 'w');
      let endWeekDate = startWeekDate.clone().add(6, 'd');
      return [startWeekDate.format('YYYY-MM-DD'), endWeekDate.format('YYYY-MM-DD')]
    },
    performSubjectChange(lesson) {
      if (lesson.id > 0) lesson.isChanged = 1;
      if (lesson.ktpId == '') this.setEmpty(lesson)

      this.checkConflict();

    },
    checkConflict() {
      let conflict = {
        teachers: {},
        cabinets: {},
        details: []
      };

      _.each(this.dateCourseEvent, (courses, courseNum) => {
        _.each(courses, (groups, groupId) => {
          let groupRow = this.courses[courseNum].groups[groupId]
          groupRow.hours = 0;
          _.each(groups, (pair, pairNum) => {
            if (pair.ktpId > 0) {
              groupRow.hours += 2;
              let key;

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
              if (pair.cabinetId > 0) {
                key = pair.cabinetId + '_' + pairNum;
                if (!conflict.cabinets[key]) {
                  conflict.cabinets[key] = [];
                }
                conflict.cabinets[key].push(pair);
              }
              if (pair.optionalCabinetId > 0 && pair.cabinetId !== pair.optionalCabinetId) {
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
          let teacherName = this.employeePairs[_.split(String(key), '_', 1)[0]]
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
          let cabinetNumber = (_.find(this.cabinets, (item) => String(item.id) == cabinetId)).number
          let detail = `Пара ${lessonNumber} Кабинет: ${cabinetNumber} в группах:  ${groups}`
          conflict.details.push(detail)
        }

      })
      this.conflicts = conflict;
    },
    getLessonEmployees(lessonData) {
      let row = _.get(this.courses, [this.selectedCourse, 'groups', lessonData.groupId], false);
      if (!row) {
        return [];
      }
      let subject = _.find(row.subjects, (subject) => subject.ktpId == lessonData.ktpId);
      return subject ? subject.employees.practice : [];
    },
    getWeekHours() {
      let courses = this.courses;
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getWeekHours', {
        date: this.date
      }).then((res) => {
        let data = res.data;
        _.each(courses, (courseGroups, course) => {
          _.each(courseGroups.groups, (group) => {
            let hours = _.get(data, [group.groupId, 'hours'], {});
            let hoursCount = 0;
            _.each(hours, (hour, day) => {
              hoursCount += (day != this.date ? hour : 0);
            });
            group.otherDayHours = hoursCount;
          })
        })
      });
    },

    getCourses(course) {
      switch (Number(course)) {
        case 1:
          return this.courses[1].groups;
        case 2:
          return this.courses[2].groups;
        case 3:
          return this.courses[3].groups;
        case 4:
          return this.courses[4].groups;
        default:
          return this.courses[5].groups;
      }
    },
    getSubjectsByGroup() {
      let courses = this.courses;
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getSubjects', {
        date: this.date
      }).then((res) => {
        _.each(res.data, (group) => {
          if (!_.get(courses, [group.course, 'groups', group.groupId], false)) {
          } else {
            courses[group.course].groups[group.groupId].subjects = group.subjects
          }
        })
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
      return _.get(this.courses, [this.selectedCourse, 'groups', groupId, 'subjects'], []);
    },
    UpdateDateCourseEvent() {
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
          })
        })
      })

      this.conflicts.cabinets = {}
      this.conflicts.details = []
      this.conflicts.teachers = {}
      this.selectedCourse = 1
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getCurrentSchedule', {
        date: this.date
      }).then((res) => {
        _.each(res.data, (row) => {
          let element = _.get(this.dateCourseEvent, [row.course, row.groupId, row.lesson_number], false);
          if (element) {
            element.ktpId = row.ktp_id;
            element.id = row.id;
            element.teacher = row.main_emp;
            element.teacherId = row.teacher_id;
            element.optionalTeacher = row.group_emp;
            element.optionalTeacherId = row.optional_teacher_id;
            element.cabinet = row.number;
            element.cabinetId = row.cabinet_id;
            element.optionalCabinet = row.optional_cabinet;
            element.optionalCabinetId = row.optional_cabinet_id;
            element.isChanged = 0;
            element.status = row.status == 1;
          }
        })
        this.checkConflict();
        this.getWeekHours();
      })
    },
    initDateCourseEvent() {
      this.dateCourseEvent = {}
      for (let k = 1; k < 5; k++) {
        this.dateCourseEvent[k] = {}
        let groups = this.getCourses(k)
        _.each(groups, (group) => {
          this.dateCourseEvent[k][group.groupId] = {}
          for (let j = 1; j < 8; j++) {
            this.dateCourseEvent[k][group.groupId][j] = {
              group: group.name,
              groupId: group.groupId,
              subject: '',
              subjectId: null,
              ktpId: null,
              teacher: '',
              teacherId: null,
              optionalTeacher: '',
              optionalTeacherId: null,
              cabinet: '',
              cabinetId: null,
              optionalCabinet: '',
              optionalCabinetId: null,
              status: false,
              error: [],
              id: 0

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
    }
    ,
    hasConflictCabinet(cabinetId, pair) {
      return {
        'selectdiv': true,
        'conflict': _.get(this.conflicts, ['cabinets', cabinetId + '_' + pair], 0).length > 1,
      }
    }
    ,
    cellInfo(pair){
      if(pair.isChanged===1){
        return{'changed':true}
      }
      if(pair.isChanged===0){
        return{'usual':true}
      }
      if(pair.ktpId!==''&&(pair.cabinetId===''||pair.teacherId==='')){
        return{'notFullForm':true}
      }
    },
    test(asd) {
    }
    ,
    sendPostObject() {
      _.each(this.dateCourseEvent, (course) => {
        _.each(course, (group) => {
          _.each(group, (lesson, key) => {
            let elem = lesson
            let notEmpty = (elem.ktpId != '' && elem.teacherId != '' && elem.cabinetId != null)
            if (notEmpty) {
              //если пара уже была, но изменили данные внутри
              if (elem.id != 0 || elem.id != '') {
                console.log(elem)
                //update
                if (elem.isChanged > 0) elem.isChanged = 0
                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/updateSchedule', {
                  id: elem.id,
                  ktp: elem.ktpId,
                  teacher: elem.teacherId,
                  optionalTeacher: elem.optionalTeacherId!==null?elem.optionalTeacherId: null,
                  cabinet: elem.cabinetId,
                  optionalCabinet: elem.optionalCabinetId!==null ? elem.optionalCabinetId : null,
                  //потом добавить
                  // event:elem.event,
                  lessonNumber: key,
                  groupId: elem.groupId,
                  status: (elem.status == true) ? 1 : 0,
                  date: this.date
                }).then((res) => {
                  // toaster.success('Расписание сохранено')
                })
                //если пары не было, добавили новую
              } else {
                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/createNewLesson', {
                  ktp: elem.ktpId,
                  teacher: elem.teacherId,
                  optionalTeacher: elem.optionalTeacherId!==null?elem.optionalTeacherId: null,
                  cabinet: elem.cabinetId,
                  optionalCabinet: elem.optionalCabinetId!==null ? elem.optionalCabinetId : null,
                  //потом добавить
                  // event:elem.event,
                  lessonNumber: key,
                  groupId: elem.groupId,
                  status: (elem.status == true) ? 1 : 0,
                  date: this.date
                }).then((res) => {
                  // toaster.success('Расписание сохранено')
                  elem.id = res.data.id
                })
              }
            } else {
              if (elem.id != '' && elem.ktpId == '') {

                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/deleteSchedule', {
                  id: elem.id
                }).then((res) => {
                })
              }
            }
          })
        })
      })
      toaster.success('Расписание сохранено')

    },

    initGroups() {

      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then((res) => {
            for (let i = 0; i < res.data.length; i++) {
              let gr = res.data[i]
              this.courses[gr.course].groups[gr.groupId] = {...gr, subjects: [], hours: 0};
            }

            this.initDateCourseEvent();
            this.getSubjectsByGroup();
            this.changeDate();

          }
      )
    }
    ,
    initCabinets() {
      //получение текущей даты
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/cabinets/all').then((res) => {
        _.each(res.data, (cabinet) => {
          this.cabinetsPairs[cabinet.id] = cabinet.number
        })
        this.cabinets = res.data
      })
    }
    ,
    initEmployees() {
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getEmployees').then((res) => {
        this.employeePairs = res.data;
      })
    }
  },
  mounted() {
    this.selectedCourse = '1';

    this.initEmployees();
    this.initCabinets();
    this.initGroups();

    //установка текущего курса по умолчанию на 1
    //запросы на получение информации

  },
  computed: {
    orderedCabinets() {
      return _.orderBy(this.cabinetsPairs)

    },
    env() {
      return process.env
    },
  }

}
</script>

<style>
.changed {
  border-radius: 10px;
  background: #ffe3c5;
}
.notFullForm {
  border-radius: 10px;
  background: #ff576e;
}

.usual {
  border-radius: 10px;
}

.tooLow {
  background-color: #efbd58;
}

.normal {
  background-color: #8bf68b;
}

.tooMuch {
  background-color: #ac3232;
}

.table tbody td {
  padding: 5px 10px;

}

.alertBlocks {
  display: flex;
  flex-direction: column;
  margin-top: 35px;
}

.alert {
  padding: 2px;
  background-color: #f44336;
  color: white;
  border-radius: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 19px;
  margin-top: 5px;
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
  min-height: 3rem;
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

  border: none;
  margin-bottom: 20px;
  border-collapse: separate;

}

.table thead th {
  font-weight: bold;
  text-align: left;
  border: none;
  padding: 5px 10px;
  background: #D9EDF7;
  font-size: 14px;
  border-top: 1px solid #ddd;
  width: 7.9%;
}

.table tr th:first-child, .table tr td:first-child {
  border-left: 1px solid #ddd;
}

.table tr th:last-child, .table tr td:last-child {
  border-right: 1px solid #ddd;
}

.table thead tr th:first-child {
  border-radius: 20px 0 0 0;
}

.table thead tr th:last-child {
  border-radius: 0 20px 0 0;
}

.table tbody td {
  text-align: left;
  border: none;
  padding: 5px 10px;
  font-size: 14px;
  vertical-align: top;
}

.table tbody tr:nth-child(even) {
  background: #F8F8F8;
}

.table tbody tr:last-child td {
  border-bottom: 1px solid #ddd;
}

.table tbody tr:last-child td:first-child {
  border-radius: 0 0 0 20px;
}

.table tbody tr:last-child td:last-child {
  border-radius: 0 0 20px 0;
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
  position: relative;
  align-items: center;


  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: 100%;
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
  display: flex;
  flex-direction: column;
  justify-items: center;
}

select.conflict {
  border-color: #ff3333;
  border-width: 2px;
  background-color: #ffcccc;
}

</style>