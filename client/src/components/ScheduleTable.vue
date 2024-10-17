<template>
  <div>
    <table class="w-full border-collapse border border-slate-500 rounded-sm ">
      <thead class="">
      <tr>
        <th class="bg-gray-100 border border-gray-300 ">пара</th>
        <th class="bg-gray-100 border border-gray-300  px-16" v-for="day in weekDates" :key="day.date">
          {{ getDayMonthString(day.date) }} ({{ day.weekDay }})
        </th>
      </tr>
      </thead>
      <tbody class="tbody_items">
      <tr v-for="lessonNumber in 7">
        <td class="bg-gray-100 border border-gray-300 p-1 px-6 py-2">

          {{ lessonTime[lessonNumber - 1] }}

        </td>
        <td class="border border-gray-300 p-0 m-0 w-64 " v-for="day in weekDates" :key="day">

          <schedule-cell :schedule="getLesson(day.date, lessonNumber)"
                         class="bg-sky-100 mt-1 mr-1 mb-1 ml-1 border border-gray-300 rounded-lg"/>
          <template v-if="getLesson(day.date, lessonNumber).custom">
            <schedule-cell :schedule="lesson"
                           v-for="lesson in getLesson(day.date, lessonNumber).custom"
                           />

          </template>
        </td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import ScheduleMixin from "@/mixins/schedule.mixin";
import DatesMixin from "@/mixins/dates.mixin";
import ScheduleCell from "@/components/ScheduleTableCell";
import LessonTime from "@/enums/LessonTime";


export default {
  components: {ScheduleCell},
  name: "ScheduleTable",
  mixins: [ScheduleMixin, DatesMixin],


  computed: {
    lessonTime() {
      return LessonTime;
    }
  },
  props: {
    scheduleType: {
      type: String,
      default: 'group',
      required: true,
    },
    scheduleParam: {
      type: Number,
      default: 0,
      required: true,
    },
    weekDates: {
      type: Array,
      default: [],
    },
  },
  methods: {
    getLesson(date, lessonNumber) {
      switch (this.scheduleType) {
        case 'group':
          return this.getLessonByGroup(this.scheduleParam, date, lessonNumber)
        case 'cabinet':
          return this.getLessonByCabinet(this.scheduleParam, date, lessonNumber)
        case 'employee':
          return this.getLessonByEmployee(this.scheduleParam, date, lessonNumber)
      }
      return {};
    },

  }
}
</script>

<style scoped></style>