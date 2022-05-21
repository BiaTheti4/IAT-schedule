<template>
  <div>
<template v-for="group in groups">
  {{group}}
</template>
    <select class="button-6" v-model="selectedGroup">
      <option value="" selected></option>
      <option v-for="(group,idx) in this.groups" :key="group.name" :value="group.groupId"> {{ group[idx].name }}</option>
    </select>

    <div v-if="groupList(selectedGroup)==''">
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
          <tr v-for="paraNumber in 7" :key="paraNumber">
            <td>{{ paraNumber }}</td>
            <td v-for="paraInDay in week" :key="paraInDay">

              <div class="event" v-if="this.weekEvents[group.name][paraInDay.date][paraNumber].subject!==''">
                <label>{{ this.weekEvents[group.name][paraInDay.date][paraNumber].subject }}
                  (каб.{{ this.weekEvents[group.name][paraInDay.date][paraNumber].cabinet }})</label>

                <label></label>
                <label>Преподаватель:{{ this.weekEvents[group.name][paraInDay.date][paraNumber].teacher }}</label>
                <label v-if="this.weekEvents[group.name][paraInDay.date][paraNumber].status==1"
                       class="distant">Дистант</label>
              </div>
              <div class="event_none" v-if="this.weekEvents[group.name][paraInDay.date][paraNumber].subject==''">
                <label>нет</label>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <h2>{{ selectedGroup }}</h2>
      <table class="table">
        <thead class="thead_items">
        <tr>
          <th>пара</th>

          <th v-for="day in week" :key="day.date">{{ day.date }} ({{ day.weekDay }})</th>
        </tr>
        </thead>
        <tbody class="tbody_items">
        <tr v-for="paraNumber in 7" :key="paraNumber">
          <td class="paraNumber">{{ paraNumber }}</td>

          <td v-for="paraInDay in week" :key="paraInDay">

            <div class="event" v-if="this.weekEvents[selectedGroup][paraInDay.date][paraNumber].subject!==''">
              <label>Предмет:{{ this.weekEvents[selectedGroup][paraInDay.date][paraNumber].subject }}</label>
              <label>Преподаватель:{{ this.weekEvents[selectedGroup][paraInDay.date][paraNumber].teacher }}</label>
              <label>Кабинет:{{ this.weekEvents[selectedGroup][paraInDay.date][paraNumber].cabinet }}</label>
              <label v-if="this.weekEvents[selectedGroup][paraInDay.date][paraNumber].status==1">Дистант</label>
            </div>
            <div class="event" v-if="this.weekEvents[selectedGroup][paraInDay.date][paraNumber].subject==''">
              <label>нет</label>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>


  </div>

</template>

<script>
import axios from "axios";
import moment from "moment"

export default {
  name: "scheduleView",
  data() {
    return {
      weekEvents: {},
      date: '',
      selectedGroup: '',
      groups: [],
      week: [],
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
      if (this.getWeekDay(day) == 'вс') day.setDate(day.getDate() + 1)
      console.log(day)
      let objectDate = {
        date: this.getFullDate(day),
        weekDay: this.getWeekDay(day),
      }
      this.week.push(objectDate)
      let i = 1;
      while (this.week.length < 5) {
        let nextDay = new Date(day);
        nextDay.setDate(day.getDate() + i);
        i++
        let objectDate = {
          date: this.getFullDate(nextDay),
          weekDay: this.getWeekDay(nextDay),
        }
        if (objectDate.weekDay == 'вс') continue
        this.week.push(objectDate)

      }
      // console.log(this.week)

    },
    //инициализация объектов для занятий
    initDateCourseEvent() {
      for (let g = 0; g < this.groups.length; g++) {
        this.weekEvents[this.groups[g].name] = {}
        let grp = this.weekEvents[this.groups[g].name]
        for (let d = 0; d < this.week.length; d++) {
          grp[this.week[d].date] = {}
          let para = grp[this.week[d].date]
          for (let p = 1; p < 8; p++) {
            para[p] = {
              subject: '',
              teacher: '',
              cabinet: '',
              status: 0,
            }
          }
        }
        // console.log(this.weekEvents[this.groups[g].name])
      }
      //запрос на получение информации о расписании
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getTeachers', {
        time: this.DateToBD(new Date(this.date))
      }).then((res) => {
        this.UpdateDateCourseEvent(res)

      })
    },
    //обновление объектов занятий.
    UpdateDateCourseEvent(res) {
      for (let i = 0; i < res.data.length; i++) {

        let date = this.getFullDate(new Date(res.data[i].date))
        let grp = res.data[i].group_name
        let pare = res.data[i].paraNumber

        this.weekEvents[grp][date][pare].subject = res.data[i].subject_name
        this.weekEvents[grp][date][pare].teacher = res.data[i].teacher_name
        this.weekEvents[grp][date][pare].cabinet = res.data[i].cabinet_name
        this.weekEvents[grp][date][pare].status = res.data[i].status
      }
    },
    Init() {
      //запрос на получение групп
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/groups/all').then(res => {
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].status = (res.data[i].status == 1) ? true : false
        }
        this.groups = res.data
      })
      //запрос на получение расписания
      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getWeekSchedule', {
        time: this.DateToBD(this.date)
      }).then((res) => {
        console.log(res.data)
        this.initDateCourseEvent()
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