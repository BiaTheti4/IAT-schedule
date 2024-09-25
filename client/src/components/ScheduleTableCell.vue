<template>

  <div class="text-center relative" v-if="isHasLesson" @click="handleClick" @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <div>{{ getLessonType(schedule.lessonType) }}</div>
    <div class="truncate overflow-hidden whitespace-nowrap w-64 flex flex-col">
      <b>{{ schedule.groupName }}</b>
      <b>{{ schedule.subject }}</b>
    </div>

    <div v-if="isExpanded"
      class="absolute top-0 left-0 bg-sky-100 border border-gray-200 shadow-lg rounded-lg  p-4 w-96 max-w-full z-20 flex flex-col">
      <div>{{ getLessonType(schedule.lessonType) }}</div>
      <b>{{ schedule.groupName }}</b>
      <b>{{ schedule.subject }}</b>
      <div>{{ schedule.mainTeacher }}
        <template v-if="schedule.optionalTeacher">/{{ schedule.optionalTeacher }}</template>
      </div>
      {{ schedule.cabinet }}

      <template v-if="schedule.optionalCabinet">
        /{{ schedule.optionalCabinet }}
      </template>
    </div>

    <div>{{ schedule.mainTeacher }}
      <template v-if="schedule.optionalTeacher">/{{ schedule.optionalTeacher }}</template>
    </div>
    {{ schedule.cabinet }}
    
    <template v-if="schedule.optionalCabinet">
      /{{ schedule.optionalCabinet }}
    </template>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {

  props: {
    schedule: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const isExpanded = ref(false);
    // Наведение мыши (ПК)
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

    // Клик (мобильные устройства)
    const handleClick = () => {
      if (isMobileDevice()) {
        isExpanded.value = !isExpanded.value;
      }
    };

    // Определение мобильного устройства
    const isMobileDevice = () => {
      return /Mobi|Android/i.test(navigator.userAgent);
    };
    return {
      isExpanded,
      handleMouseEnter,
      handleMouseLeave,
      handleClick
    };
  },
  components: {
  },
  computed: {
    isHasLesson() {
      return this.schedule && this.schedule.subject;
    },


  },
  methods: {
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
    }
  },
  mounted() {

  }
};
</script>

<style scoped></style>