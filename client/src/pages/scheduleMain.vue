<template>

  <div>
    <button @click="checkDublicateTeacher">
      qweqwe
    </button>
    <div class="datePicker" id="content">
      <form>
        <input class="button-6" type="date" @change="UpdateDateCourseEvent(date);getWeekHours() " v-model="date">
        <select class="button-6" v-model="selectedCourse"
                @change="getSubjectsByGroup()">
          <option v-for="n in 5" :value="n">{{ n }} курс</option>
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
        <td v-for="(group,groupId) in dateCourseEvent[selectedCourse]">
          <div class="formSubjects">
            <select class="selectdiv"
                    v-model="group[para].ktpId"
                    @change="performSubjectChange()"
            >
              <option></option>
              <option v-for="subject in getSubjectList(groupId)" :key="subject.ktpId" :value="subject.ktpId">
                {{ subject.nameShort }}
              </option>
            </select>
            <template v-if="group[para].ktpId">

              <select :class="hasConflictTeacher(group[para].teacherId,para)"
                      @change="performSubjectChange();"
                      v-model="group[para].teacherId"
              >
                <option :value="null"></option>
                <option v-for="employeeId in getLessonEmployees(group[para])"
                        :value="employeeId">
                  {{ employeePairs[employeeId] }}
                </option>
              </select>


              <select v-model="group[para].optionalTeacherId"
                      @change="performSubjectChange();"
                      :class="hasConflictTeacher(group[para].optionalTeacherId,para)"
              >
                <option :value="null"></option>
                <option v-for="employeeId in getLessonEmployees(group[para])"
                        :value="employeeId">
                  {{ employeePairs[employeeId] }}
                </option>
              </select>


              <select class="selectdiv"
                      @change="performSubjectChange();"
                      :class="hasConflictCabinet(group[para].cabinetId,para)"
                      v-model="group[para].cabinetId">
                <option></option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <select class="selectdiv" @change="performSubjectChange();"
                      :class="hasConflictCabinet(group[para].optionalCabinetId,para)"
                      v-model="group[para].optionalCabinetId">
                <option></option>
                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>

              <!--постараться сделать этo-->
              <!--                        <input @change="checkDublicateCabinet(group[para].cabinet)"-->
              <!--                               v-model="group[para].cabinet" :list="group[para].id"/>-->
              <!--                        <datalist>-->

              <!--                          <option></option>-->
              <!--                          <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">-->
              <!--                            {{ cabinet.name }}-->
              <!--                          </option>-->
              <!--                        </datalist>-->

              <div class="distant">
                <div>дистант
                  <input type="checkbox" v-model="group[para].status"></div>
              </div>
              <div class="tooltip" v-if="group[para].error.length!==0">!
                <span class="tooltiptext">
                  <span v-for="(err,idx) in group[para].error" :key="idx">{{ err }}</span>
                </span>
              </div>
            </template>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          Количество часов в неделю:
        </td>
        <td v-for="(group,idx) in getCourses(selectedCourse)" :key="idx">
          {{ group.hours * 2 }}

        </td>

      </tr>
      </tbody>

    </table>


    <button class="button-7" @click="sendPostObject">отправить</button>
    <div class="tooltip">!


      <span>
                  <span class="tooltiptext" :key="idx">
                    <span></span>
                  </span>
                </span>
    </div>

    <div>
      Конфликты:
    <span v-for="conflict in conflicts.details">
      {{conflict}}
    </span>
    </div>
  </div>
</template>

<script>


import axios from "axios";
import moment from 'moment';
import _ from 'lodash';

export default {
  data() {
    return {
      employeePairs: {},
      cabinetsPairs: {},
      date: '',
      selectedCourse: '',
      cabinets: [],
      conflicts: {
        teachers: {},
        cabinets: {},
        details:[]
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
        1: {groups: []},
        2: {groups: []},
        3: {groups: []},
        4: {groups: []}
      },
    }
  },
  methods: {
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
    performSubjectChange() {
      this.getWeekHours();
      this.checkConflict();
    },
    checkConflict() {
      let conflict = {
        teachers: {},
        cabinets: {},
        details: []
      };
      _.each(this.dateCourseEvent, (courses) => {
        _.each(courses, (groups => {
          _.each(groups, (pair, pairNum) => {
            if (pair.ktpId > 0) {
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
        }))
      })

      _.each(conflict.teachers, (teachers, key) => {
        if (teachers.length > 1) {
          let groups = teachers.map(item => item.group).join(', ')
          let teacherName = this.employeePairs[_.split(String(key), '_', 1)[0]]
          let detail = `Преподаватель: ${teacherName} в группах: ${groups}`
          conflict.details.push(detail)
        }
      })
      _.each(conflict.cabinets, (cabinets, key) => {
        if (cabinets.length > 1) {
          let cabinetId = _.split(String(key), '_', 1)[0]
          let groups = cabinets.map(item => item.group).join(', ')
          let cabinetNumber = (_.find(this.cabinets, (item) => String(item.id) === cabinetId)).number
          let detail = `Кабинет: ${cabinetNumber} в группах:  ${groups}`
          conflict.details.push(detail)
        }

      })
      this.conflicts = conflict;
    },
    getLessonEmployees(lessonData) {
      let row = _.find(this.courses[this.selectedCourse].groups, row => lessonData.groupId === row.groupId);
      if (!row) {
        return [];
      }
      let subject = _.find(row.subjects, (subject) => subject.ktpId === lessonData.ktpId);
      return subject ? subject.employees.theory : [];
    },
    getWeekHours() {
      let week = this.getStudyWeek()
      for (let i = 0; i < this.getCourses(this.selectedCourse).length; i++) {
        let groupId = this.getCourses(this.selectedCourse)[i].groupId

        axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getWeekHours', {
          startWeek: week[0],
          endWeek: week[1],
          groupId: groupId,
          currentDate: this.date
        }).then((res) => {
              this.courses[this.selectedCourse].groups[i].hours = res.data[0][0].hours
              let groupName = this.courses[this.selectedCourse].groups[i].id;
              for (let lessonNumber = 1; lessonNumber < 8; lessonNumber++) {
                if (this.dateCourseEvent[this.selectedCourse][groupId][lessonNumber].subjectId !== '') {
                  this.courses[this.selectedCourse].groups[i].hours += 1
                  // console.log(this.courses[this.selectedCourse].groups[i].name)
                  // console.log(this.dateCourseEvent[this.selectedCourse].group[lessonNumber].subjectId)
                }
              }
            }
        )
      }
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
          return this.courses[1].groups;
      }
    },
    async getSubjectsByGroup() {
      this.courses[this.selectedCourse].groups.forEach((group) => {
        axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getSubjects', {
          group: group.groupId,
          date: this.date
        }).then((res) => {
              group.subjects = res.data
            }
        )
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
      let row = _.find(this.courses[this.selectedCourse].groups, row => row.groupId == groupId);
      return row.subjects;
    },
    getTeacherName(id) {
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getTeachers', {
        teacher: id
      }).then((res) => {
        return res
      })
    },
    getTeacherBySubject(subjectId, group, idx, groupLesson) {
      // console.log(subjectId)
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getTeachers', {
        subject: subjectId,
        group: idx

      }).then((res) => {
            // console.log(res.data)
            groupLesson.teacherId = res.data[0].employeeId,
                groupLesson.teacher = res.data[0].main_emp,
                groupLesson.optionalTeacher = res.data[0].group_emp,
                groupLesson.optionalTeacherId = res.data[0].group_employee
          }
      ).catch(err => console.warn(err))
    },
    UpdateDateCourseEvent() {
      this.selectedCourse = 1
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getCurrentSchedule', {
        date: this.date
      }).then((res) => {
        res.data.forEach(function (row) {
          let element = _.get(this.dateCourseEvent, [row.course, row.groupId, row.lesson_number], false);
          if (element) {
            element.subject = row.subject;
            element.ktpId = row.ktpId;
            element.subjectId = row.subject_id;
            element.teacher = row.main_emp;
            element.teacherId = row.teacher_id;
            element.optionalTeacher = row.group_emp;
            element.optionalTeacherId = row.optional_teacher_id;
            element.cabinet = row.number;
            element.cabinetId = row.cabinet_id;
            element.optionalCabinet = row.optional_cabinet;
            element.optionalCabinetId = row.optional_cabinet_id;
            element.status = row.status == 1;
          }
        });
      })
      this.getWeekHours()
    },
    initDateCourseEvent() {
      this.dateCourseEvent = {}
      for (let k = 1; k < 5; k++) {
        this.dateCourseEvent[k] = {}
        let groups = this.getCourses(k)
        for (let i = 0; i < groups.length; i++) {
          this.dateCourseEvent[k][groups[i].groupId] = {}
          for (let j = 1; j < 8; j++) {
            this.dateCourseEvent[k][groups[i].groupId][j] = {
              group: groups[i].name,
              groupId: groups[i].groupId,
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
        }
      }
      this.getWeekHours()
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
    test(asd) {
      console.log(asd)
    },
    sendPostObject() {

      //итерации по курсу
      for (let k = 1; k < 5; k++) {
        //группы в курсе
        let groups = this.getCourses(k)
        //итерации по группам
        for (let i = 0; i < groups.length; i++) {
          //итерации по номеру пары
          for (let j = 1; j < 8; j++) {
            //информация о паре выбранной группы
            let elem = this.dateCourseEvent[k][groups[i].name][j]
            //проверка на пустой предмет
            let notEmpty = (elem.subjectId != '' && elem.teacherId != '' && elem.cabinetId != '')
            //проверка на пустой  элемент расписания
            if (notEmpty) {
              //если пара уже была, но изменили данные внутри
              if (elem.id != 0 || elem.id != '') {
                //update
                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/updateSchedule', {
                  id: elem.id,
                  subject: elem.subjectId,
                  teacher: elem.teacherId,
                  optionalTeacher: (elem.optionalTeacherId) ?? null,
                  cabinet: elem.cabinetId,
                  optionalCabinet: (elem.optionalCabinetId) ?? null,
                  //потом добавить
                  // event:elem.event,
                  lessonNumber: j,
                  groupId: groups[i].groupId,
                  status: (elem.status == true) ? 1 : 0,
                  date: this.date
                }).then((res) => {
                  console.log(elem.subject + ' успешно добавлено')
                })
                //если пары не было, добавили новую
              } else {

                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/createNewLesson', {
                  subject: elem.subjectId,
                  teacher: elem.teacherId,
                  optionalTeacher: elem.optionalTeacherId === '' ? null : elem.optionalTeacherId,
                  cabinet: elem.cabinetId,
                  optionalCabinet: elem.optionalCabinetId === '' ? null : elem.optionalCabinetId,
                  //потом добавить
                  // event:elem.event,
                  lessonNumber: j,
                  groupId: groups[i].groupId,
                  status: (elem.status == true) ? 1 : 0,
                  date: this.date
                }).then((res) => {
                  console.log(elem.subject + ' успешно добавлено')
                })
              }
            } else {
              if (elem.id != '' && elem.subjectId == '') {
                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/deleteSchedule', {
                  id: elem.id
                }).then((res) => {
                  console.log(elem.id + ' ' + elem.subject + ' ' + ' успешно удалено')
                })
              }
            }
          }
        }
      }
    },

    checkSpaceBetween() {
      //итерации по курсу
      for (let k = 1; k < 5; k++) {
        //группы в курсе
        let groups = this.getCourses(k)
        //итерации по группам
        for (let i = 0; i < groups.length; i++) {
          //итерации по номеру пары
          let arr = []
          let firstElem = ''
          for (let j = 1, asd = 0; j < 8; j++, asd++) {
            if (this.dateCourseEvent[k][groups[i].name][j].cabinet !== ''
                && this.dateCourseEvent[k][groups[i].name][j].subject !== ''
                && this.dateCourseEvent[k][groups[i].name][j].teacher !== '') {
              if (firstElem = '') firstElem = j
              else
                arr.push(j)
            }
            console.log(firstElem)
            // if (arr[j] < arr.length && arr[j + 1] - arr[j] !== 1) {
            //   console.log('ПРОБЕЛ МЕЖДУ ПАРАМИ' )
            // } else {
            //   console.log('все ок')
            // }

          }
        }
      }
    },
    // checkEmptySelect() {
    //   //итерации по курсу
    //   for (let k = 1; k < 5; k++) {
    //     //группы в курсе
    //     let groups = this.getCourses(k)
    //     //итерации по группам
    //     for (let i = 0; i < groups.length; i++) {
    //       //итерации по номеру пары
    //       for (let j = 1; j < 8; j++) {
    //         //информация о паре выбранной группы
    //         let elem = this.dateCourseEvent[k][groups[i].name][j]
    //
    //         //проверка на пустой предмет
    //         let correct = ((elem.subject == '' && elem.teacher == '' && elem.cabinet == '') || (elem.subject != '' && elem.teacher != '' && elem.cabinet != ''))
    //
    //         //проверка на пустой  элемент расписания
    //         if (!correct) {
    //           alert('Некорректно заполнена пара' + '\n' + 'группа: ' + groups[i].name + '\n' + 'пара:' + j)
    //         }
    //       }
    //     }
    //   }
    // }
    // ,

    checkDublicateCabinet(cabinet) {
      // for (let p = 1; p < 8; p++) {
      //   let arrCabinets = []
      //   for (let k = 1; k < 5; k++) {
      //     let groups = this.getCourses(k)
      //     for (let i = 0; i < groups.length; i++) {
      //       let elem = this.dateCourseEvent[k][groups[i].name][p]
      //       if (elem.cabinet != '') {
      //         let inArr = false
      //         for (let j = 0; j < arrCabinets.length; j++) {
      //           if (arrCabinets[j].elem.cabinet == elem.cabinet) {
      //             inArr = true
      //             console.log("повторный выбор кабинета " + elem.cabinet)
      //             let elemArr = {
      //               elem: elem,
      //               group: groups[i].name,
      //               para: p,
      //               course: k
      //             }
      //             console.log(arrCabinets[j])
      //             console.log(elemArr)
      //           }
      //         }
      //         if (!inArr) {
      //           let arrItem = {
      //             elem: elem,
      //             group: groups[i].name,
      //             para: p,
      //             course: k
      //           }
      //           arrCabinets.push(arrItem)
      //         }
      //       }
      //     }
      //   }
      //   // console.log("para: " + p)
      // }
      // // console.log("--------------------")
    }
    ,
    Init() {

      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then((res) => {
            // console.log(res.data)
            for (let i = 0; i < res.data.length; i++) {
              let gr = res.data[i]
              this.courses[gr.course].groups.push({...gr, subjects: [], hours: 0})

            }

            this.getSubjectsByGroup()
            this.initDateCourseEvent();
            this.UpdateDateCourseEvent();
          }
      )

    },
    initCabinets() {
      //получение текущей даты
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/cabinets/all').then((res) => {
        _.each(res.data, (cabinet) => {
          this.cabinetsPairs[cabinet.id] = cabinet.number
        })
        this.cabinets = res.data
      })
    },
    initEmployees() {
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getEmployees').then((res) => {
        this.employeePairs = res.data;
      })
    }
  },
  mounted() {
    this.initEmployees();
    this.initCabinets();
    this.initDateCourseEvent();
    this.UpdateDateCourseEvent();

    let today = new Date();
    this.date = today.getFullYear() + '-' + (today.getMonth() + 1 > 9 ? today.getMonth() : "0" + (today.getMonth() + 1)) + '-' + (today.getDate() > 9 ? today.getDate() : "0" + today.getDate());

    //установка текущего курса по умолчанию на 1
    this.selectedCourse = '1';
    //запросы на получение информации

    this.Init();
  },
  computed: {
    orderedCabinets() {
      console.log(_.orderBy(this.cabinetsPairs))
      return _.orderBy(this.cabinetsPairs)

    },
    env() {
      return process.env
    },


  }

}
</script>

<style>
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
  padding: 10px 15px;
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
  padding: 10px 15px;
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