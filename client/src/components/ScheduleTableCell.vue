<template>
  <div class="text-center" v-if="isHasLesson" 
       @click="handleClick"
       @mouseenter="handleMouseEnter"
       @mouseleave="handleMouseLeave"
  >
    <Tooltip :message="schedule.subject"></Tooltip> 
    <div>{{ getLessonType(schedule.lessonType) }}</div>

    <!-- Этот блок реагирует на изменение isExpanded, но события вешаются на родителя -->
    <div :class="{'truncate overflow-hidden whitespace-nowrap w-64': !isExpanded}">
      <b>{{ schedule.subject }}</b>
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
import Tooltip from './Tooltip.vue';

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
    Tooltip
  },
  computed: {
    isHasLesson() {
      return this.schedule && this.schedule.subject;
    }
  },
  methods: {
    getLessonType(lessonType) {
      const lessonTypes = {
        't': 'Теория',
        'c': 'Теория',
        's': 'Теория',
        'p': 'Практика',
        'l': 'Практика',
        'k': 'Курсовая работа',
      };
      return lessonTypes[lessonType] || '';
    }
  },
};
</script>

<style scoped></style>
