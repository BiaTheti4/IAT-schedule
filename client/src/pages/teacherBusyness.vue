<template>
  <div class="datePicker" id="content">
    <form>
      <select class="button-6" v-model="selectedEmployee">
        <option value="" selected>Все преподаватели</option>
        <option v-for="(teacher,idx) in teachers" :value="idx">
          {{ teacher }}
        </option>
      </select>

    </form>
  </div>
  <div v-if="isLoaded==true">
    <div v-if="selectedEmployee==''">
      <div v-for="(teacher,idx) in teachers" :key="teacher">
        <h1>{{ teacher }}</h1>
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
              {{ dateCourseEvent[idx][lessonInDay.date][lessonNumber].cabinet }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <h1>{{ teachers[selectedEmployee] }}</h1>
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
            {{ dateCourseEvent[selectedEmployee][lessonInDay.date][lessonNumber].cabinet }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!--  <br>-->
  <!--  </div>-->
</template>

<script>
import axios from "axios";
import _ from "lodash";

export default {
  name: "teacherBusyness",
  data() {
    return {
      cabinets: [],
      teachers: {},
      date: '',
      isLoaded: false,
      week: [],
      selectedEmployee: '',
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
      _.each(this.teachers, (fio, id) => {
        this.dateCourseEvent[id] = {}
        _.each(this.week, (date) => {
          this.dateCourseEvent[id][date.date] = {}
          for (let p = 1; p < 8; p++) {
            this.dateCourseEvent[id][date.date][p] = {}
            this.dateCourseEvent[id][date.date][p].teacher = ''
            this.dateCourseEvent[id][date.date][p].cabinet = ''
          }

        })

      })
      this.updateDateCourseEvent(this.week[0].date, this.week[4].date);
    },
    updateDateCourseEvent(dateStart, dateEnd) {

      axios.post(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/schedule/getEmployeeSchedule', {
        dateStart: dateStart,
        dateEnd: dateEnd
      }).then((res) => {

        for (let i = 0; i < res.data.length; i++) {

          this.dateCourseEvent[res.data[i].emp_id][res.data[i].date][res.data[i].lesson_number].teacher = res.data[i].employee
          this.dateCourseEvent[res.data[i].emp_id][res.data[i].date][res.data[i].lesson_number].cabinet = res.data[i].cab_numbers
        }
        this.isLoaded = true;
      })

    },
    getBusynessEmployees() {
      axios.get(this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT + '/api/ktp/getEmployees').then((res) => {
        this.teachers = res.data;
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

</style>