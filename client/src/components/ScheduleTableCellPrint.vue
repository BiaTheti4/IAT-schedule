<template>
  <td class="tableCell align-middle h-16 m-0 p-0">
    <div class="flex h-14 w-24 text-clip mx-auto overflow-hidden break-all">
      <div v-if="isHasLesson"><u>{{ schedule.subject }}</u>
        <br />
        <em>{{schedule.mainTeacher}}<template v-if="schedule.optionalTeacher">/{{schedule.optionalTeacher}}</template></em>
      </div>
      <div v-else>
        &nbsp;
      </div>
    </div>
  </td>
  <td class="tableCell">
    <template v-if="isHasLesson">
      {{ getCabinet(schedule['cabinet']) }}
      <template v-if="schedule['optionalCabinet']"> {{ getCabinet(schedule['optionalCabinet']) }}</template>
    </template>
  </td>

</template>

<script>

import ScheduleMixin from "@/mixins/schedule.mixin";

export default {
  name: "ScheduleTableCellPrint",
  mixins: [ScheduleMixin],
  props: {
    schedule: {
      type: Object,
      default: {},
    }
  },
  methods: {
    getCabinet(name) {
      if (!name) {
        return '';
      }
      return this.subjectCabinetCorrect(name);
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
.tableCell {
  @apply border border-sky-700 p-1 max-h-8 text-sm leading-3 font-normal tracking-tight;
}
</style>