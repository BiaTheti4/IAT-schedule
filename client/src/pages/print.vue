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
<!--      {{ getFullDate(this.date) }}-->
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
        <td>{{ lessonTime[para-1] }}</td>
        <td v-for="(group) in dateCourseEvent[selectedCourse]" :key="group">
          <div class="formSubjects" v-if="group[para].subject!=''">
            <div>{{group[para].subject}}</div>
            <div>(каб. {{group[para].cabinet}} {{group[para].optionalCabinet}})</div>
            <div>{{group[para].teacher}}</div>
            <div v-if="group[para].optional_teacher!=''">{{group[para].optional_teacher}}</div>
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
      lessonTime:[
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
  computed:{
    env() {
      return process.env
    }
  },
  methods: {
    getFullDate(date) {
      return date.getFullYear() + '.' + (date.getMonth() + 1 > 9 ? date.getMonth() : "0" + (date.getMonth() + 1)) + '.' + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    },
    dateToDb(date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1 > 9 ? date.getMonth() : "0" + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    },

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
    UpdateDateCourseEvent() {
      this.selectedCourse = 1
      for (let k = 1; k < 5; k++) {
        let groups = this.getCourses(k)
        for (let i = 0; i < groups.length; i++) {
          for (let j = 1; j < 8; j++) {
            let elem = this.dateCourseEvent[k][groups[i].name][j]
            elem.subject = ''
            elem.teacher = ''
            elem.optional_teacher = ''
            elem.cabinet = ''
            elem.optionalCabinet = ''
            elem.status = (groups[i].status == 1) ? 1 : 0,
                elem.id = 0
          }
        }
      }
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getPrintSchedule', {
        date: this.dateToDb(new Date(this.date))
      }).then((res) => {
        for (let i = 0; i < res.data.length; i++) {

          let elem = this.dateCourseEvent[res.data[i].course][res.data[i].name][res.data[i].lesson_number]

          elem.subject = res.data[i].nameShort
          elem.teacher = res.data[i].main_emp
          elem.optional_teacher = res.data[i].group_emp
          elem.cabinet = res.data[i].number
          elem.optionalCabinet = res.data[i].optionalCabinet
          if (res.data[i].status == 1) {
            elem.status = true
          } else {
            elem.status = false
          }
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
              optionalCabinet: '',
              status: false,
              id: 0
            }
          }
        }
      }
    },

    Init() {
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then((res) => {
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

    this.date =this.dateToDb(today);
    //установка текущего курса по умолчанию на 1
    this.selectedCourse = '1';
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
    vertical-align: baseline;
    width: auto;
    margin: 0 0 0 10px;
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