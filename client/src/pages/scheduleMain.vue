<template>
  <div>

    <div class="datePicker" id="content">
      <form>
        <input class="button-6" type="date" @change="UpdateDateCourseEvent(date)" v-model="date"
               min="{{this.disabledDates}}">
        <select class="button-6" v-model="selectedCourse"
                @change="getSubjectsByGroup()"
        >
          <option v-for="n in 5" :value="n">{{ n }} курс</option>
        </select>
      </form>

    </div>
    <button @click="test()">

    </button>
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
        <td v-for="(group,idx) in dateCourseEvent[selectedCourse]">
          <div class="formSubjects">

            <select class="selectdiv"
                    v-model="group[para].subjectId"
                    @click="getSubjectList(idx)"
                    @change="setEmpty(group[para]);"
            >
              <option></option>
              <option v-for="subject in getSubjectList(idx)" :key="subject.subjectId" :value="subject.subjectId">
                {{ subject.nameShort }}
              </option>
            </select>
            <template v-if="group[para].subjectId">

              <select class="selectdiv"
                      v-model="group[para].teacherId"
                      @click="getTeacherBySubject(group[para].subjectId,Object.keys(dateCourseEvent[selectedCourse]),idx,group[para])">
                <option></option>
                <option
                    :value="group[para].teacherId">
                  {{ group[para].teacher }}
                </option>
              </select>


              <select v-model="group[para].optionalTeacherId">
                <option
                    :value="group[para].optionalTeacherId">
                  {{ group[para].optionalTeacher }}
                </option>
              </select>


              <select class="selectdiv" @click=""
                      v-model="group[para].cabinetId">
                <option></option>
                <option v-if="group[para].subjectId!==''"
                        v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                  {{ cabinet.number }}
                </option>
              </select>
              <!--              доделать выбор опционального кабинета если есть опциональный преподаватель-->
              <!--              <select class="selectdiv" @click=""-->
              <!--                      v-model="group[para].cabinet">-->
              <!--                <option></option>-->
              <!--                <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">-->
              <!--                  {{ cabinet.number }}-->
              <!--                </option>-->
              <!--              </select>-->

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
            </template>
          </div>
        </td>
      </tr>
      </tbody>
    </table>

    <button class="button-7" @click="sendPostObject">отправить</button>
    <button class="button-7" @click="checkEmptySelect">проверить</button>


  </div>
</template>

<script>


import axios from "axios";

export default {
  data() {
    return {

      date: '',
      selectedCourse: '',
      cabinets: [],
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
      disabledDates: {},
      courses: {
        1: {groups: []},
        2: {groups: []},
        3: {groups: []},
        4: {groups: []}
      },
    }
  },
  methods: {
    test() {
      let monday = new Date(this.date)
      let day = monday.getDay() || 7;
      if (day !== 1)
        monday.setHours(-24 * (day - 1));
      let saturday = new Date(monday.setDate(monday.getDate() + 5));


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
      for (let group in this.courses[this.selectedCourse].groups) {
        axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getSubjects', {
          group: this.courses[this.selectedCourse].groups[group].name
        }).then((res) => {
              console.log(res.data)
              this.courses[this.selectedCourse].groups[group].subjects = res.data

            }
        )
      }

    },
    setEmpty(lesson) {
      lesson.cabinet = ''
      lesson.cabinetId = ''
      lesson.teacher = ''
      lesson.teacherId = ''
      lesson.optionalTeacher = ''
      lesson.optionalTeacherId = ''
      lesson.status = ''
    },

    // в test лежит название группы
    getSubjectList(test) {
      let course = this.selectedCourse;
      for (let i in this.courses[course].groups) {
        if (this.courses[course].groups[i].name === test) {
          return this.courses[course].groups[i].subjects
        } else {
          i++
        }
      }
      console.log(test)
      return this.courses[this.selectedCourse].groups[group]?.subjects
    },
    getTeacherName(id) {
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getTeachers', {
        teacher: id
      }).then((res) => {
        return res
      })
    },
    getTeacherBySubject(subjectId, group, idx, groupLesson) {
      console.log(subjectId)
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getTeachers', {
        subject: subjectId,
        group: idx

      }).then((res) => {
            console.log('asdasd')
            console.log(res.data)
            groupLesson.teacherId = res.data[0].employeeId,
                groupLesson.teacher = res.data[0].main_emp,
                groupLesson.optionalTeacher = res.data[0].group_emp,
                groupLesson.optionalTeacherId = res.data[0].group_employee
          }
      ).catch(err => console.warn(err))
    },

    UpdateDateCourseEvent() {
      this.selectedCourse = 1
      for (let k = 1; k < 5; k++) {
        let groups = this.getCourses(k)
        for (let i = 0; i < groups.length; i++) {
          for (let j = 1; j < 8; j++) {
            let elem = this.dateCourseEvent[k][groups[i].name][j]
            elem.subject = ''
            elem.subjectId = ''
            elem.teacher = ''
            elem.teacherId = ''
            elem.optionalTeacher = ''
            elem.optionalTeacherId = ''
            elem.cabinet = ''
            elem.status = (groups[i].status == 1) ? 1 : 0,
                elem.id = 0
          }
        }
      }
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getCurrentSchedule', {
        date: this.date
      }).then((res) => {
        console.log('======================================================')
        console.log(res.data)
        for (let i = 0; i < res.data.length; i++) {
          let elem = this.dateCourseEvent[res.data[i].course][res.data[i].name][res.data[i].lesson_number]

          elem.subject = res.data[i].subject
          elem.subjectId = res.data[i].subject_id
          elem.teacher = res.data[i].main_emp
          elem.teacherId = res.data[i].teacher_id
          elem.optionalTeacher = res.data[i].group_emp
          elem.optionalTeacherId = res.data[i].optional_teacher_id
          elem.cabinet = res.data[i].number
          elem.cabinetId = res.data[i].cabinet_id
          if (res.data[i].status == 1) {
            elem.status = true
          } else {
            elem.status = false
          }
          elem.id = res.data[i].id;
        }
      })
    },
    initDateCourseEvent() {
      this.dateCourseEvent = {}
      for (let k = 1; k < 5; k++) {
        this.dateCourseEvent[k] = {}
        let groups = this.getCourses(k)
        for (let i = 0; i < groups.length; i++) {
          this.dateCourseEvent[k][groups[i].name] = {}
          for (let j = 1; j < 8; j++) {
            this.dateCourseEvent[k][groups[i].name][j] = {
              subject: '',
              subjectId: '',
              teacher: '',
              teacherId: '',
              optionalTeacher: '',
              optionalTeacherId: '',
              cabinet: '',
              cabinetId: '',
              status: false,
              id: 0

            }
          }
        }
      }
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
                  optionalTeacher: (elem.optionalTeacherId) ?? null,
                  cabinet: elem.cabinetId,
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
              if (elem.id != '') {
                axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/deleteSchedule', {
                  id: elem.id
                }).then((res) => {
                  console.log(' успешно удалено')
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
            if (this.dateCourseEvent[k][groups[i].name][j].cabinet != ''
                && this.dateCourseEvent[k][groups[i].name][j].subject != ''
                && this.dateCourseEvent[k][groups[i].name][j].teacher != '') {
              if (firstElem = '') firstElem = j
              else
                arr.push(j)
            }
            console.log(firstElem)
            // if (arr[j] < arr.length && arr[j + 1] - arr[j] !== 1) {
            //   console.log('ПРОБЕЛ МЕЖДУ ПАРАМИ')
            // } else {
            //   console.log('все ок')
            // }

          }

        }

      }

    },
    checkDublicateTeacher() {
      for (let p = 1; p < 8; p++) {
        let arrTeacher = []
        for (let k = 1; k < 5; k++) {
          let groups = this.getCourses(k)
          for (let i = 0; i < groups.length; i++) {

            let elem = this.dateCourseEvent[k][groups[i].name][p]
            if (elem.teacher != '') {
              let inArr = false
              for (let j = 0; j < arrTeacher.length; j++) {
                if (arrTeacher[j].elem.teacher == elem.teacher) {
                  inArr = true
                  console.log("повторный выбор Преподователя " + elem.teacher)
                  let elemArr = {
                    elem: elem,
                    group: groups[i].name,
                    para: p,
                    course: k
                  }
                  console.log(arrTeacher[j])
                  console.log(elemArr)
                }
              }
              if (!inArr) {
                let arrItem = {
                  elem: elem,
                  group: groups[i].name,
                  para: p,
                  course: k
                }
                arrTeacher.push(arrItem)
              }
            }
          }
        }
        console.log("para: " + p)
      }
      console.log("--------------------")


    },
    checkEmptySelect() {
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
            let correct = ((elem.subject == '' && elem.teacher == '' && elem.cabinet == '') || (elem.subject != '' && elem.teacher != '' && elem.cabinet != ''))

            //проверка на пустой  элемент расписания
            if (!correct) {
              alert('Некорректно заполнена пара' + '\n' + 'группа: ' + groups[i].name + '\n' + 'пара:' + j)
            }
          }
        }
      }
    },

    checkDublicateCabinet(cabinet) {
      for (let p = 1; p < 8; p++) {
        let arrCabinets = []
        for (let k = 1; k < 5; k++) {
          let groups = this.getCourses(k)
          for (let i = 0; i < groups.length; i++) {

            let elem = this.dateCourseEvent[k][groups[i].name][p]
            if (elem.cabinet != '') {
              let inArr = false
              for (let j = 0; j < arrCabinets.length; j++) {
                if (arrCabinets[j].elem.cabinet == elem.cabinet) {
                  inArr = true
                  console.log("повторный выбор кабинета " + elem.cabinet)
                  let elemArr = {
                    elem: elem,
                    group: groups[i].name,
                    para: p,
                    course: k
                  }
                  console.log(arrCabinets[j])
                  console.log(elemArr)
                }
              }
              if (!inArr) {
                let arrItem = {
                  elem: elem,
                  group: groups[i].name,
                  para: p,
                  course: k
                }
                arrCabinets.push(arrItem)
              }
            }
          }
        }
        console.log("para: " + p)
      }
      console.log("--------------------")
    },
    Init() {

      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then((res) => {
            // console.log(res.data)
            for (let i = 0; i < res.data.length; i++) {
              let gr = res.data[i]
              this.courses[gr.course].groups.push({...gr, subjects: []})
            }
            this.getSubjectsByGroup()
            this.initDateCourseEvent();
            this.UpdateDateCourseEvent();
          }
      )

    },


  },
  mounted() {

    //получение текущей даты
    let today = new Date();
    axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/cabinets/all').then((res) => {
      // console.log(res.data)
      for (let i = 0; i < res.data.length; i++) {
        let cb = {
          id: res.data[i].id,
          number: res.data[i].number
        }
        this.cabinets.push(cb)
        // this.courses[gr.course].groups.push(gr)
      }
    })
    this.initDateCourseEvent();
    this.UpdateDateCourseEvent();


    this.date = today.getFullYear() + '-' + (today.getMonth() + 1 > 9 ? today.getMonth() : "0" + (today.getMonth() + 1)) + '-' + (today.getDate() > 9 ? today.getDate() : "0" + today.getDate());

    //установка текущего курса по умолчанию на 1
    this.selectedCourse = '1';
    //запросы на получение информации

    this.Init()

  },
  computed: {
    env() {
      return process.env
    },


  }

}
</script>

<style>
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

</style>