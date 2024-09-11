<template>
  <div class="text-center" v-if="isHasLesson">
    <strong>{{ schedule.subject }}</strong>
    ({{ schedule.cabinet }}
    <template v-if="schedule.optionalCabinet">
      /{{ schedule.optionalCabinet }}
    </template>)
    <div>{{ schedule.mainTeacher }}
      <template v-if="schedule.optionalTeacher">/{{ schedule.optionalTeacher }}</template>
    </div>
  </div>
  <div class="text-gray-400 text-center bg-gray-200 align-middle h-20 p-0 m-0" v-else>
    нет
  </div>

</template>

<script>

export default {
  name: "ScheduleTableCell",
  props: {
    schedule: {
      type: Object,
      default: {},
    }
  },
  computed: {
    isHasLesson() {
      return this.schedule && this.schedule.subject;
    }
  }
}
</script>

<style scoped>

</style>