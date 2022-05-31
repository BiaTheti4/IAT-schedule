<template>
  <div>
    <select class="button-6" v-model="selectedGroup">
      <option value="" selected></option>
      <option v-for="group in groups" :key="group.name" :value="group.name">
        {{ group.name }}
      </option>
    </select>
    <template v-if="selectedGroup===''">
      <div v-for="group in groups" :key="group">
        <h2>{{ group.name }}</h2>
        <table class="table">
          <thead class="thead_items">
          <tr>
            <th class="first_column">пара</th>
            <th class="other_columns" v-for="day in week" :key="day.date">{{ day.date }} ({{ day.weekDay }})</th>
          </tr>
          </thead>
          <tbody class="tbody_items">
          <tr v-for="lessonNumber in 7">
            <td>{{ lessonTime[lessonNumber-1] }}</td>
            <td v-for="lessonInDay in week" :key="lessonInDay">

              <div class="event" v-if="this.weekEvents[group.name][lessonInDay.date][lessonNumber].subject!==''">
                <label>{{ this.weekEvents[group.name][lessonInDay.date][lessonNumber].subject }}</label>
                <label>кабинет:{{ this.weekEvents[group.name][lessonInDay.date][lessonNumber].cabinet }}</label>
                <label>Преподаватель: {{
                    this.weekEvents[group.name][lessonInDay.date][lessonNumber].mainTeacher
                  }}</label>
                <label v-if=" this.weekEvents[group.name][lessonInDay.date][lessonNumber].optionalTeacher">Преподаватель
                  в группе: {{ this.weekEvents[group.name][lessonInDay.date][lessonNumber].optionalTeacher }}</label>
                <label class="distant" v-if="this.weekEvents[group.name][lessonInDay.date][lessonNumber].status=0">Дистант</label>
              </div>
              <div class="event_none" v-if="this.weekEvents[group.name][lessonInDay.date][lessonNumber].subject===''">
                <label>нет</label>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="selectedGroup!==''">
      <h2>{{ selectedGroup }}</h2>
      <table class="table">
        <thead class="thead_items">
        <tr>
          <th class="first_column">пара</th>
          <th class="other_columns" v-for="day in week" :key="day.date">{{ day.date }} ({{ day.weekDay }})</th>
        </tr>
        </thead>
        <tbody class="tbody_items">
        <tr v-for="lessonNumber in 7">
          <td>{{ lessonNumber }}</td>
          <td v-for="lessonInDay in week" :key="lessonInDay">

            <div class="event" v-if="this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].subject!==''">
              <label>{{ this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].subject }}</label>
              <label>кабинет:{{ this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].cabinet }}</label>
              <label>Преподаватель: {{
                  this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].mainTeacher
                }}</label>
              <label v-if=" this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].optionalTeacher!==''">Преподаватель
                в группе: {{
                  this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].optionalTeacher
                }}</label>
              <label class="distant"
                     v-if="this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].status=0">Дистант</label>
            </div>
            <div class="event_none"
                 v-if="this.weekEvents[this.selectedGroup][lessonInDay.date][lessonNumber].subject===''">
              <label>нет</label>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </template>


  </div>

</template>

<script>
import axios from "axios";

export default {
  name: "scheduleView",
  data() {
    return {
      weekEvents: {},
      date: '',
      selectedGroup: '',
      groups: [],
      week: [],
      lessonTime:[
          '08:30-10:00',
          '10:10-11:40',
          '12:10-13:40',
          '13:50-15:20',
          '15:50-17:20',
          '17:30-19:00',
          '19:10-20:40',
      ]
    }
  },
  methods: {
    //возврат дня недели для удобного составления расписания
    getWeekDay(date) {
      let days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      return days[date.getDay()];
    },
    getFullDate(date) {
      return date.getFullYear() + '.' + (date.getMonth() + 1 > 9 ? date.getMonth() : "0" + (date.getMonth() + 1)) + '.' + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    },
    DateToBD(date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1 > 9 ? date.getMonth() : "0" + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    },
//получение рабочей недели без воскресенья
    getWorkWeek() {

      let day = new Date();
      if (this.getWeekDay(day) === 'вс') day.setDate(day.getDate() + 1)
      console.log(day)
      let objectDate = {
        date: this.DateToBD(day),
        weekDay: this.getWeekDay(day),
      }
      this.week.push(objectDate)
      let i = 1;
      while (this.week.length < 5) {
        let nextDay = new Date(day);
        nextDay.setDate(day.getDate() + i);
        i++
        let objectDate = {
          date: this.DateToBD(nextDay),
          weekDay: this.getWeekDay(nextDay),
        }
        if (objectDate.weekDay === 'вс') continue
        this.week.push(objectDate)

      }
      // console.log(this.week)

    },
    //инициализация объектов для занятий
    initDateCourseEvent(res) {

      for (let g = 0; g < this.groups.length; g++) {
        this.weekEvents[this.groups[g].name] = {}
        let grp = this.weekEvents[this.groups[g].name]
        for (let d = 0; d < this.week.length; d++) {
          grp[this.week[d].date] = {}
          let para = grp[this.week[d].date]
          for (let p = 1; p < 8; p++) {
            para[p] = {
              subject: '',
              mainTeacher: '',
              optionalTeacher: '',
              cabinet: '',
              status: 0,
            }
          }
        }
      }
      for (let j in res.data) {

        let date = this.DateToBD(new Date(res.data[j].date))
        console.log(date)
        let grp = res.data[j].name
        let para = res.data[j].lesson_number
        this.weekEvents[grp][date][para].subject = res.data[j].subject_name
        this.weekEvents[grp][date][para].mainTeacher = res.data[j].main_emp
        this.weekEvents[grp][date][para].optionalTeacher = res.data[j].group_emp
        this.weekEvents[grp][date][para].cabinet = res.data[j].number
        this.weekEvents[grp][date][para].event = res.data[j].event
      }
    },
    Init() {
      //запрос на получение групп
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then(res => {
        this.groups = res.data
      })
      //запрос на получение расписания
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/week', {
        date: this.DateToBD(this.date)
      }).then((res) => {
        this.initDateCourseEvent(res)
      })
    },
    groupList(selected) {
      return selected
    }

  },
  computed: {
    env() {
      return process.env
    }
  },

  mounted() {
    this.date = new Date();
    this.getWorkWeek()
    this.Init()
  }

}
</script>

<style scoped>
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

.event {
  display: flex;
  flex-direction: column;
  width: auto;

}

.distant {
  margin-top: 5px;
  background: #5bc0de;
}

.event_none {
  /*background: palevioletred;*/
}

.first_column {
  width: 30px;
}

.other_columns {
  width: 250px;
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
</style>