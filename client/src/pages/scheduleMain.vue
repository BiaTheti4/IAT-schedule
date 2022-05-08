<template>
  <div>

    <div class="datePicker" id="content">
      <form>
        <input class="button-6" type="date" @change="UpdateDateCourseEvent(date)" v-model="date">
        <select class="button-6" v-model="selectedCourse">
          <option v-for="n in 5" :value="n">{{ n }} курс</option>
        </select>
      </form>

    </div>
    <br>
    <div class="table">
      <thead>
      <tr>
        <th>Пара</th>
        <th v-for="group in getCourses(selectedCourse)" :key="group">
          <div class="thGroup">
            <div> {{ group.name }}</div>
            <template v-if="group.status==1">Дистант</template>
          </div>
        </th>
      </tr>
      </thead>
      <tr v-for="para in 7" :key="para.value">
        <td>{{ para }} пара</td>
        <td v-for="(group) in dateCourseEvent[selectedCourse]" :key="group">
          <div class="formSubjects">
            <select class="selectdiv"
                    v-model="group[para].subject">
              <option></option>
              <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
            <select class="selectdiv" @change="checkDublicateTeacher(group[para].teacher)"
                    v-model="group[para].teacher">
              <option></option>
              <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                {{ teacher.name }}
              </option>
            </select>
            <select class="selectdiv" @change="checkDublicateCabinet(group[para].cabinet,group[para])"
                    v-model="group[para].cabinet">
              <option></option>
              <option v-for="cabinet in cabinets" :key="cabinet.id" :value="cabinet.id">
                {{ cabinet.name }} - {{ cabinet.type }}
              </option>
            </select>

            <!--постараться сделать эту хрень-->
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
          </div>
        </td>
      </tr>
    </div>

    <button class="button-7" @click="sendPostObject">отправить</button>
    <button class="button-7" @click="checkEmptySelect">проверить</button>
    <!-- HTML !-->


  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      subjects: [],
      cabinets: [],
      teachers: [],
      date: '',
      selectedCourse: '',
      dateCourseEvent: {},

      courses: {
        1: {groups: []},
        2: {groups: []},
        3: {groups: []},
        4: {groups: []}
      },
    }
  },
  methods: {
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
    UpdateDateCourseEvent() {
      this.selectedCourse=1
      for (let k = 1; k < 5; k++) {
        let groups = this.getCourses(k)
        for (let i = 0; i < groups.length; i++) {
          for (let j = 1; j < 8; j++) {
            let elem = this.dateCourseEvent[k][groups[i].name][j]
            elem.subject = ''
            elem.teacher = ''
            elem.cabinet = ''
            elem.status = (groups[i].status == 1) ? 1 : 0,
                elem.id = 0
          }
        }
      }
      axios.post('http://localhost:5000/currentSchedule', {
        time: this.date
      }).then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          let elem = this.dateCourseEvent[this.selectedCourse][res.data[i].group_name][res.data[i].paraNumber]
          elem.subject = res.data[i].subject_id
          elem.teacher = res.data[i].teacher_id
          elem.cabinet = res.data[i].cabinet_id
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
        let groups = this.getCourses(k) //this.courses[k]
        for (let i = 0; i < groups.length; i++) {
          this.dateCourseEvent[k][groups[i].name] = {}
          for (let j = 1; j < 8; j++) {
            this.dateCourseEvent[k][groups[i].name][j] = {
              subject: '',
              teacher: '',
              cabinet: '',
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
            let notEmpty = (elem.subject != '' && elem.teacher != '' && elem.cabinet != '')
            //проверка на пустой  элемент расписания
            if (notEmpty) {
              //если пара уже была, но изменили данные внутри
              if (elem.id != '') {
                //update
                axios.patch("http://localhost:5000/patchSchedule", {
                  id: elem.id,
                  subject: elem.subject,
                  teacher: elem.teacher,
                  cabinet: elem.cabinet,
                  paraNumber: j,
                  groupId: groups[i].id,
                  status: (elem.status == true) ? 1 : 0,
                  date: this.date
                }).then((res) => {
                  console.log(res.data)
                })
                //если пары не было, добавили новую
              } else {

                axios.post('http://localhost:5000/postSchedule', {
                  subject: elem.subject,
                  teacher: elem.teacher,
                  cabinet: elem.cabinet,
                  paraNumber: j,
                  groupId: groups[i].id,
                  status: elem.status,
                  date: this.date
                }).then((res) => {
                  console.log(res.data)
                })
              }
            } else {
              if (elem.id != '') {
                axios.post('http://localhost:5000/deleteSchedule', {
                  id: elem.id
                }).then((res) => {
                  console.log(res.data)
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
      axios.get('http://localhost:5000/groups').then((res) => {
            for (let i = 0; i < res.data.length; i++) {
              let gr = res.data[i]
              // console.log(gr)
              this.courses[gr.course].groups.push(gr)
            }
            this.initDateCourseEvent();
            this.UpdateDateCourseEvent();
          }
      )
    },


  },
  mounted() {
    //получение текущей даты
    let today = new Date();
    let fullDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + (today.getDate() > 9 ? today.getDate() : "0" + today.getDate());
    this.date = fullDate;
    //установка текущего курса по умолчанию на 1
    this.selectedCourse = '1';
    //запросы на получение информации
    axios.get('http://localhost:5000/cabinets').then(res => (this.cabinets = res.data))
    axios.get('http://localhost:5000/teachers').then(res => (this.teachers = res.data))
    axios.get('http://localhost:5000/subjects').then(res => (this.subjects = res.data))

    this.Init()
  },

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
  width: 100%;
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

.selectorSubject {

}

body {
  background: #fff;
}

.selectdiv {
  position: relative;
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
  font-weight: 400;
  justify-content: center;
  line-height: 1.25;
  padding-left: 5px;

  text-decoration: none;
  transition: all 250ms;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  width: 100%;
}

.selectdiv:hover,
.selectdiv:focus {
  border-color: rgba(0, 0, 0, 0.15);

  color: rgba(0, 0, 0, 0.65);
}

.selectdiv:hover {
  transform: translateY(-1px);
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