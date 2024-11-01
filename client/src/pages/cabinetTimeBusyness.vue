<template class="mt-4">
  <div class="flex items-center space-x-4">
    <div class="w-64 mx-2">
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
          <input
              v-model="selectedTime"
              @change="getLessonByTime"
              type="time"
              id="time"
              class="bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-300 block w-full p-2.5"
              required
          />
        </div>
      </form>
    </div>
    <p v-if="currentLesson !== null">Номер пары: {{ currentLesson + 1 }}</p>
  </div>
  <table class="w-1/2 border-collapse border border-slate-500 rounded-lg mx-2">
    <thead>
    <tr>
      <th class="border border-slate-600">Кабинет</th>
      <th class="border border-slate-600">Занятость</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(cabinet, index) in availableCabinets" :key="cabinet.id">
      <td class="border border-slate-700">{{ cabinet.number }}</td>
      <td :class="getCabinetStatusClass(cabinet)" class="border border-slate-700">
        {{ getCabinetStatus(cabinet) }}
      </td>
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
      date: moment().format("YYYY-MM-DD"),
      selectedTime: moment().format("HH:mm"),
      currentLesson: null,
    };
  },
  watch: {
    date: "updateSchedule",
    selectedTime: "getLessonByTime",
  },
  computed: {
    availableCabinets() {
      return this.cabinets;
    },
  },
  methods: {
    parseTime(timeString) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
    formatTimeUntilNextLesson(minutes) {
      const hours = Math.floor(minutes / 60); // Вычисляем количество полных часов
      const remainingMinutes = minutes % 60;  // Остаток минут после часов

      // Формируем строку с учетом правильного склонения
      const hoursText = hours ? `${hours} час${hours > 1 ? 'а' : ''}` : '';
      const minutesText = remainingMinutes ? `${remainingMinutes} минут` : '';
      return `${hoursText} ${minutesText}`.trim();
    },
    // Пример использования в getCabinetStatus
    getCabinetStatus(cabinet) {
      const todaySchedule = this.store.cabinetSchedule[cabinet.id]?.[this.date];
      if (!todaySchedule) return "Кабинет свободен";

      const selectedTime = this.parseTime(this.selectedTime);
      let nextLessonTime = null;

      for (const lesson of Object.values(todaySchedule)) {
        const lessonStart = this.parseTime(lessonTime[lesson.lessonNumber - 1].split('-')[0]);
        const lessonEnd = this.parseTime(lessonTime[lesson.lessonNumber - 1].split('-')[1]);

        if (selectedTime >= lessonStart && selectedTime <= lessonEnd) {
          return "Занят";
        }
        if (selectedTime < lessonStart && !nextLessonTime) {
          nextLessonTime = lessonStart;
        }
      }

      if (nextLessonTime) {
        const timeUntilNextLesson = moment(nextLessonTime).diff(selectedTime, 'minutes');
        return `Пара начнется через ${this.formatTimeUntilNextLesson(timeUntilNextLesson)}`;
      }
      return "Кабинет свободен";
    },
    getCabinetStatusClass(cabinet) {
      const status = this.getCabinetStatus(cabinet);
      if (status === "Занят") {
        return "bg-red-500 text-white";
      } else if (status.startsWith("Пара начнется")) {
        return "bg-yellow-500 text-black";
      } else {
        return "bg-green-500 text-white";
      }
    },
    updateSchedule() {
      this.getSchedule(this.date, this.date);
      this.getLessonByTime();
    },
    changeDate(date) {
      this.date = moment(date || new Date()).format("YYYY-MM-DD");
    },
    checkCurrentTimeInIntervals() {
      const selectedTime = this.parseTime(this.selectedTime);
      this.currentLesson = lessonTime.findIndex((interval) => {
        const [start, end] = interval.split("-");
        const startTime = this.parseTime(start);
        const endTime = this.parseTime(end);
        return selectedTime >= startTime && selectedTime <= endTime;
      });
    },
    getLessonByTime() {
      if (this.selectedTime) {
        this.checkCurrentTimeInIntervals();
      }
    },
  },
  mounted() {
    this.updateSchedule();
    this.initCabinets();
  },
};
</script>
