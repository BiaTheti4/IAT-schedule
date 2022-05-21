<template>
  <div class="printNone">
    <div class="datePicker" id="content">
      <form>
        <input class="button-6" type="date" @change="UpdateDateCourseEvent(date)" v-model="date">
        <select class="button-6" v-model="selectedCourse">
          <option v-for="n in 4" :value="n">{{ n }} курс</option>
        </select>
        <a class="button-7" href="javascript:window.print()">Печать</a>
      </form>

    </div>
    <br>
  </div>
  <div class="printSchedule">
    <h1 class="date">
      {{ this.date }}
    </h1>
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
        <td>{{ para }} пара</td>
        <td v-for="(group) in dateCourseEvent[selectedCourse]" :key="group">
          <div class="formSubjects" v-if="group[para].subject!=''">
            <div> {{ getSubject(group[para].subject) }}</div>
            <div>{{ getCabinet(group[para].cabinet) }}</div>
            <div>{{ getTeacher(group[para].teacher) }}</div>
            <div class="distant">
              <div v-if="group[para].status==1">дистант</div>
            </div>
          </div>
          <div v-else>нет</div>
        </td>
      </tr>
      </tbody>
    </table>
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
    getTeacher(t) {
      let teacherId = t
      let teacherName = ''
      for (let i = 0; i < this.teachers.length; i++) {
        if (this.teachers[i].id === teacherId) {
          teacherName = this.teachers[i].name
          break
        }
      }
      return (teacherName)
    },
    getSubject(s) {
      let subjectId = s
      let subjectName = ''
      for (let i = 0; i < this.subjects.length; i++) {
        if (this.subjects[i].id === subjectId) {
          subjectName = this.subjects[i].name
          break
        }
      }
      return (subjectName)
    },
    getCabinet(c) {
      let cabinetId = c
      let cabinetName = ''
      for (let i = 0; i < this.cabinets.length; i++) {
        if (this.cabinets[i].id === cabinetId) {
          cabinetName = this.cabinets[i].name
          break
        }
      }
      return (cabinetName)
    },
    getDay() {
      let day = this.date;
      let fullDate = (day.getDate() > 9 ? day.getDate() : "0" + day.getDate() + '.' + (day.getMonth() + 1) + '.' + day.getFullYear());
      console.log(fullDate)


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
    download() {
      let elem = document.getElementById("content")
      html2pdf(elem)
    },
    UpdateDateCourseEvent() {
      this.selectedCourse = 1
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
      axios.post('http://localhost:5000/printSchedule', {
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


    // возврат дня недели для удобного составления расписания
    // getDayWeek() {
    //   let today = new Date();
    //   let days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    //   let date = new Date(2021, 0, 16);
    //   alert(days[date.getDay()]);
    // }

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
@media print {
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
    border: solid black;
    border-radius: 20px;
    margin-bottom: 20px;
    border-collapse: separate;

  }

  .table thead th {
    font-weight: bold;
    text-align: left;
    border: solid black;
    padding: 10px 15px;
    background: #ffffff;
    font-size: 14px;
    border-top: 1px solid #ddd;
  }


  .table tbody td {
    text-align: left;
    border: solid black;
    padding: 5px 5px;
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

  body {
    background: #fff;
  }

  .thGroup {
    display: flex;
    flex-direction: column;
    justify-items: center;
  }

  .distant {
    margin-top: 5px;
    background: #5bc0de;
    border-radius: 5px;
    padding-left: 3px;
  }

  .date {
    margin-left: auto;
    margin-right: auto;
  }

  .printSchedule {
    margin: 1cm;
  }

  printSchedule {

  }

  printNone {
    display: none;
  }

  .datePicker {
    display: none;
  }

  div#app nav {
    display: none;
  }
}
</style>