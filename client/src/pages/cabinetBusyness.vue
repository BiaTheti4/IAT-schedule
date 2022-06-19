<template>
  <div class="datePicker" id="content">
    <form>
      <select class="button-6" v-model="selectedCabinet">
        <option value="" selected>Все кабинеты</option>
        <option v-for="(cabinet,idx) in cabinets" :value="cabinet.number">
          {{ cabinet.number }}
        </option>
      </select>
    </form>
  </div>
  <div v-if="isLoaded===true">
    <div v-if="selectedCabinet===''">
      <div v-for="(cabinet) in cabinets" :key="cabinet.id">
        <h1>{{ cabinet.number }} кабинет</h1>
        <table class="table">
          <thead class="thead_items">
          <tr>
            <th class="first_column">пара</th>
            <th class="other_columns" v-for="day in week" :key="day.date">{{ day.date }} ({{ day.weekDay }})</th>
          </tr>
          </thead>
          <tbody class="tbody_items">
          <tr v-for="lessonNumber in 7">
            <td>{{ lessonTime[lessonNumber - 1] }}</td>
            <td v-for="lessonInDay in week" :key="lessonInDay">
              <!--              <span v-if="this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber]!==''">Занят</span>-->
              <div class="info">
                <span>{{ this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber].group }}</span>
                <span>{{ this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber].subject }}</span>
                <span>{{ this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber].teacher }}</span>
                <span v-if="this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber].optional_teacher!==''">{{ this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber].optional_teacher }}</span>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-if="selectedCabinet!==''">
    <h1>{{ selectedCabinet }} кабинет</h1>
    <table class="table">
      <thead class="thead_items">
      <tr>
        <th class="first_column">пара</th>
        <th class="other_columns" v-for="day in week" :key="day.date">{{ day.date }} ({{ day.weekDay }})</th>
      </tr>
      </thead>
      <tbody class="tbody_items">
      <tr v-for="lessonNumber in 7">
        <td>{{ lessonTime[lessonNumber - 1] }}</td>
        <td v-for="lessonInDay in week" :key="lessonInDay">
          <!--              <span v-if="this.dateCourseEvent[cabinet.number][lessonInDay.date][lessonNumber]!==''">Занят</span>-->
          <div class="info">
            <span>{{ this.dateCourseEvent[selectedCabinet][lessonInDay.date][lessonNumber].group }}</span>
            <span>{{ this.dateCourseEvent[selectedCabinet][lessonInDay.date][lessonNumber].subject }}</span>
            <span>{{ this.dateCourseEvent[selectedCabinet][lessonInDay.date][lessonNumber].teacher }}</span>
            <span v-if="this.dateCourseEvent[selectedCabinet][lessonInDay.date][lessonNumber].optional_teacher!==''">{{ this.dateCourseEvent[selectedCabinet][lessonInDay.date][lessonNumber].optional_teacher }}</span>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "cabinetBusyness",
  data() {
    return {
      cabinets: [],
      date: '',
      isLoaded: false,
      week: [],
      selectedCabinet: '',
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
    }
  },
  methods: {

    DateToBD(date) {
      return date.getFullYear() + '-' + (date.getMonth() + 1 > 9 ? date.getMonth() : "0" + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    },
    getWeekDay(date) {
      let days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      return days[date.getDay()];
    },
    getWorkWeek() {
      let day = new Date();
      if (day.getDay() === 0) day.setDate(day.getDate() + 1)

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
    },

    initDateCourseEvent() {
      _.each(this.cabinets, (cab) => {
        this.dateCourseEvent[cab.number] = {}
        _.each(this.week, (date) => {
          this.dateCourseEvent[cab.number][date.date] = {}
          for (let p = 1; p < 8; p++) {
            this.dateCourseEvent[cab.number][date.date][p] = {}
            this.dateCourseEvent[cab.number][date.date][p].cabinet = ''
            this.dateCourseEvent[cab.number][date.date][p].group = ''
            this.dateCourseEvent[cab.number][date.date][p].subject = ''
            this.dateCourseEvent[cab.number][date.date][p].teacher = ''
            this.dateCourseEvent[cab.number][date.date][p].optional_teacher = ''
          }

        })

      })
      this.updateDateCourseEvent(this.week[0].date, this.week[4].date);
    },
    updateDateCourseEvent(dateStart, dateEnd) {

      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getCabinetSchedule', {
        dateStart: dateStart,
        dateEnd: dateEnd
      }).then((res) => {
        console.log(res.data)
        for (let i = 0; i < res.data.length; i++) {

          this.dateCourseEvent[res.data[i].cabinet][res.data[i].date][res.data[i].lesson_number].cabinet = res.data[i].cabinet
          this.dateCourseEvent[res.data[i].cabinet][res.data[i].date][res.data[i].lesson_number].group = res.data[i].name
          this.dateCourseEvent[res.data[i].cabinet][res.data[i].date][res.data[i].lesson_number].subject = res.data[i].nameShort
          this.dateCourseEvent[res.data[i].cabinet][res.data[i].date][res.data[i].lesson_number].teacher = res.data[i].main
          this.dateCourseEvent[res.data[i].cabinet][res.data[i].date][res.data[i].lesson_number].optional_teacher = res.data[i].group_emp
        }
        this.isLoaded = true;
      })

    },
    getBusynessEmployees() {
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/cabinets/all').then((res) => {
        this.cabinets = res.data;
        this.initDateCourseEvent()
      })

    },
  },
  computed: {
    env() {
      return process.env
    },
  },
  mounted() {
    this.isLoaded = false;
    this.date = this.DateToBD(new Date());
    this.getWorkWeek();
    this.selectedCourse = '1';
    this.getBusynessEmployees(this.week[0].date, this.week[4].date)

  },
}
</script>

<style scoped>
.info{
  display: flex;
  flex-direction: column;
}
</style>