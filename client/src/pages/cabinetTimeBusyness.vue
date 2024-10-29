<template class="mt-4">
  <div class="flex items-center space-x-4">
    <div class="w-64">
      <Datepicker
          :modelValue="date"
          locale="ru-RU"
          :enableTimePicker="false"
          :disabledWeekDays="[0]"
          position="left"
          format="dd.MM.yyyy"
          :autoApply="true"
          :clearable="false"
          @update:modelValue="changeDate"
      />
    </div>
    <div>
      <form class="max-w-[8rem] mx-auto">
        <label for="time" class="sr-only">Select time:</label>
        <div class="relative">
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd"
                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                    clip-rule="evenodd"/>
            </svg>
          </div>
          <input v-model="selectedTime"
                 @change="getLessonByTime"
                 type="time" id="time"
                 class="bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-300 block w-full p-2.5"
                 required/>
        </div>
      </form>
    </div>
    <p v-if="currentLesson !== null">Номер пары: {{ currentLesson + 1 }}</p>
  </div>
  <table class="w-1/2  border-collapse border border-slate-500 rounded-sm ">
    <thead>
    <tr>
      <th class="border border-slate-600">Кабинет</th>

    </tr>
    </thead>
    <tbody>

    <tr v-for="(cabinet,index) in availableCabinets" :key="cabinet.id">
      <td class="border border-slate-700">{{ index+1 }} </td>
      <td class="border border-slate-700">{{ cabinet.number }}</td>

    </tr>
    </tbody>
  </table>
</template>


<script>
import lessonTime from "@/enums/LessonTime";
import moment from "moment/moment";
import ScheduleMixin from "@/mixins/schedule.mixin";
import DatesMixin from "@/mixins/dates.mixin";
import CabinetsMixin from "@/mixins/cabinets.mixin";
import GroupsMixin from "@/mixins/groups.mixin";

export default {
  name: "cabinetTimeBusy",
  mixins: [ScheduleMixin, DatesMixin, CabinetsMixin, GroupsMixin],
  data() {
    return {
      date: moment().format('YYYY-MM-DD'),
      selectedTime: moment().format('HH:mm'),
      currentLesson: null,
    }
  },
  watch: {
    date: 'updateSchedule',
    selectedTime: 'getLessonByTime',
  },
  computed: {
    availableCabinets() {
      if (this.currentLesson === null) return this.cabinets;
      return this.cabinets.filter((cabinet) => this.isFree(cabinet));
    },
  },
  methods: {
    isFree(cabinet) {
      if (this.currentLesson === null) return true; // Если пара не найдена, все кабинеты считаются свободными
      return !_.some(this.store.cabinetSchedule, (day) =>
          _.some(day[this.date], (lesson) =>
              lesson.cabinet === cabinet.number && lesson.lessonNumber === this.currentLesson + 1
          )
      );
    },
    updateSchedule() {
      this.getSchedule(this.date, this.date);
      this.getLessonByTime();
    },



    changeDate(date) {
      if (date === undefined) {
        date = new Date();
      }
      this.date = moment(date).format('YYYY-MM-DD');

    },
    parseTime(timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    checkCurrentTimeInIntervals() {
      const selectedTime = this.parseTime(this.selectedTime);
      this.currentLesson = lessonTime.findIndex((interval) => {
        const [start, end] = interval.split('-');
        const startTime = this.parseTime(start);
        const endTime = this.parseTime(end);
        return selectedTime >= startTime && selectedTime <= endTime;
      });
    },
    getLessonByTime() {
      if (this.selectedTime) {
        this.checkCurrentTimeInIntervals();
      }
    }
  },

  mounted() {
    this.updateSchedule();
    this.initCabinets();
  },
}
</script>
