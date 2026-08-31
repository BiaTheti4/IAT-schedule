<template>
  <td class="tableCell align-middle h-16 m-0 p-0">
    <div class="flex h-14 w-24 text-clip mx-auto overflow-hidden break-all"
         v-for="row in schedule"
    >
      <div v-if="isHasLesson(row)"><u>{{ row.subject }}</u>
        <br/>
        <em>{{ row.mainTeacher }}
          <template v-if="row.optionalTeacher">/{{ row.optionalTeacher }}</template>
        </em>
      </div>
      <div v-else>
        &nbsp;
      </div>
    </div>
  </td>
  <td class="tableCell">
    <template

        v-for="row in schedule"
    >
      <div v-if="isHasLesson(row)">
        {{ getCabinet(row['cabinet']) }}
        <template v-if="row['optionalCabinet']"> {{ getCabinet(row['optionalCabinet']) }}</template>
      </div>
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
    },
    isHasLesson(row) {
      return row && row.subject;
    }

  },
  computed: {
  }
}
</script>

<style scoped>
.tableCell {
  @apply border border-sky-700 p-1 max-h-8 text-sm leading-3 font-normal tracking-tight;
}
</style>