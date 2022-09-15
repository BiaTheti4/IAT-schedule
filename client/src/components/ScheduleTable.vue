<template>
  <div>
    <table class="border-collapse border border-slate-500 rounded-sm">
      <thead class="">
      <tr>
        <th class="bg-sky-300 border border-sky-600 p-1">пара</th>
        <th class="bg-sky-300 border border-sky-600 p-1" v-for="day in week" :key="day.date">
          {{ getDayMonthString(day.date) }} ({{ day.weekDay }})
        </th>
      </tr>
      </thead>
      <tbody class="tbody_items">
      <tr v-for="lessonNumber in 7">
        <td class="bg-sky-100 border border-sky-600 p-1">{{ lessonTime[lessonNumber - 1] }}</td>
        <td
            class="border border-sky-600 p-0 m-0 w-64"
            v-for="day in week"
            :key="day">
          
        </td>
      </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
import ScheduleMixin from "@/mixins/schedule.mixin";
import DatesMixin from "@/mixins/datesMixin";
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
    week: {
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
    }
  }
}
</script>

<style scoped>

</style>