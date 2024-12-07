<template class="">
  <div class="text-center relative rounded-lg" v-if="isHasLesson" :class="checkLesson(this.schedule)" 
  @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div>{{ getLessonType(schedule.lessonType) }}</div>
    <div class="truncate overflow-hidden whitespace-nowrap w-64 flex flex-col">
      <b v-if="shouldShowGroupName">{{ schedule.groupName }}</b>
      <b>{{ schedule.subject }}</b>
    </div>

    <div v-if="isExpanded"
      class="absolute top-0 left-0  shadow-lg rounded-lg p-4 w-96 max-w-full z-20 flex flex-col"
      :class="checkLesson(this.schedule)">
      <div>{{ getLessonType(schedule.lessonType) }}</div>
      <b v-if="shouldShowGroupName">{{ schedule.groupName }}</b>
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
import { useRoute } from 'vue-router';
export default {
  props: {
    schedule: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      currentLesson: null,
      shouldShowGroupName: true
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
    checkLesson(lesson) {
      if (lesson.subject === 'Классный час') {
        return 'bg-amber-200  border border-gray-300 rounded-lg'
      } else {
        if ((lesson.lessonNumber === this.currentLesson + 1) && (lesson.date === moment().format('YYYY-MM-DD'))) {
          return 'bg-green-200 border border-gray-300 rounded-lg'
        } else {
          return 'bg-sky-100 border border-gray-200'
        }
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
      this.currentLesson = LessonTime.findIndex((interval) => {
        if (typeof interval !== 'string') return false;
        const [start, end] = interval.split('-');
        const startTime = this.parseTime(start);
        const endTime = this.parseTime(end);
        return currentTime >= startTime && currentTime <= endTime;
      });

      if (this.currentLesson !== -1) {
        return this.currentLesson;
      } else {
        return null;
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
      return _.map(lessonType, type => lessonTypes[type]).join('/') || '';
    },
  },
  mounted() {

    this.checkCurrentTimeInIntervals();
    setInterval(() => this.checkCurrentTimeInIntervals(), 60000);
    const route = useRoute();
    if (route.path === '/') {
      this.shouldShowGroupName = false;
    }
  }

}
</script>

<style scoped>

</style>
