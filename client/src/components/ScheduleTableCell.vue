<template>
  <div class="text-center relative" v-if="isHasLesson" :class="{ 'bg-green-200': checkLessonProgress(this.schedule) }"
    @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div>{{ getLessonType(schedule.lessonType) }}</div>
    <div class="truncate overflow-hidden whitespace-nowrap w-64 flex flex-col">
      <b>{{ schedule.groupName }}</b>
      <b>{{ schedule.subject }}</b>
    </div>

    <div v-if="isExpanded"
      class="absolute top-0 left-0 bg-sky-100 border border-gray-200 shadow-lg rounded-lg p-4 w-96 max-w-full z-20 flex flex-col"
      :class="{ 'bg-green-200': checkLessonProgress(this.schedule)}">
      <div>{{ getLessonType(schedule.lessonType) }}</div>
      <b>{{ schedule.groupName }}</b>
      <b>{{ schedule.subject }}</b>
      <div>{{ schedule.mainTeacher }}
        <template v-if="schedule.optionalTeacher">/{{ schedule.optionalTeacher }}</template>
      </div>
      {{ schedule.cabinet }}
      <template v-if="schedule.optionalCabinet">/{{ schedule.optionalCabinet }}</template>
    </div>

    <div>{{ schedule.mainTeacher }}
      <template v-if="schedule.optionalTeacher">/{{ schedule.optionalTeacher }}</template>
    </div>
    {{ schedule.cabinet }}
    <template v-if="schedule.optionalCabinet">/{{ schedule.optionalCabinet }}</template>
  </div>
</template>

<script>
import { ref } from 'vue';
import LessonTime from '../enums/LessonTime';
import moment from "moment";
export default {
  props: {
    schedule: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      currentLesson: null
    }
  },
  setup() {
    const isExpanded = ref(false);
    const handleMouseEnter = () => {
      if (!isMobileDevice()) {
        isExpanded.value = true;
      }
    };
    const handleMouseLeave = () => {
      if (!isMobileDevice()) {
        isExpanded.value = false;
      }
    };
    const handleClick = () => {
      if (isMobileDevice()) {
        isExpanded.value = !isExpanded.value;
      }
    };
    const isMobileDevice = () => {
      return /Mobi|Android/i.test(navigator.userAgent);
    };
    return {
      isExpanded,
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
    };
  },
  computed: {
    isHasLesson() {
      return this.schedule && this.schedule.subject;
    },

    

  },
  methods: {
    checkLessonProgress(lesson) {
      if((lesson.lessonNumber==this.currentLesson+1)&&(lesson.date==moment().format('YYYY-MM-DD'))){
        return true
      }else{
        return false
      }
    },
    parseTime(timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const now = new Date();
      now.setHours(hours, minutes, 0, 0);
      return now;
    },
    checkCurrentTimeInIntervals() {
      const currentTime = new Date();
      this.currentLesson = LessonTime.findIndex((interval, index) => {
        if (typeof interval !== 'string') return false; // Проверяем, что это строка
        const [start, end] = interval.split('-');
        const startTime = this.parseTime(start);
        const endTime = this.parseTime(end);
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (this.currentLesson !== -1) {
        return this.currentLesson; // Возвращает номер входящего интервала
      } else {
        return null; // Если не входит ни в один интервал
      }

    },

    getLessonType(lessonType) {
      const lessonTypes = {
        't': 'Теория',
        'c': 'Консультация',
        's': 'Самостоятельная работа',
        'p': 'Практическое занятие',
        'l': 'Лабораторная работа',
        'k': 'Курсовая работа',
        'z': 'Экзамен',
        'i': 'Индивидуальный проект',
      };
      return lessonTypes[lessonType] || '';
    },
  },
  mounted() {

    this.checkCurrentTimeInIntervals();
    setInterval(() => this.checkCurrentTimeInIntervals(), 60000);
  }

}
</script>

<style scoped>
.bg-green-500 {
  background-color: green;
}
</style>
