<template>
  <div>
    <select
        class="border px-2 py-1 ml-2 rounded-md border-sky-700"
        @change="correctPath"
        v-model="selectedGroup">
      <option value="" selected>Все группы</option>
      <option v-for="group in groups" :key="group.groupId" :value="group.groupId">
        {{ group.name }}
      </option>
    </select>


    <template v-for="group in groups">
      <div v-if="selectedGroup==='' || +selectedGroup===+group.groupId" :key="group.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">{{ group.name }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table
              schedule-type="group"
              :schedule-param="group.groupId"
              :week="week"
          />
        </div>
      </div>
    </template>
  </div>

</template>

<script>
import DatesMixin from '../mixins/dates.mixin'
import GroupsMixin from "@/mixins/groups.mixin";
import ScheduleMixin from "@/mixins/schedule.mixin";
import ScheduleTable from "@/components/ScheduleTable";
import ScheduleTableCell from "@/components/ScheduleTableCell";

export default {
  name: "scheduleView",
  mixins: [DatesMixin, GroupsMixin, ScheduleMixin],
  components: {ScheduleTable, ScheduleTableCell},
  data() {
    return {
      date: '',
      selectedGroup: ''
    }
  },
  methods: {
    correctPath() {
      this.$router.replace({name: "scheduleView", query: {group: this.selectedGroup}})
    },
  },


  mounted() {
    this.date = new Date();
    this.selectedGroup = this.$route.query.group || ''
    this.fillWeek()
    this.initGroups();
    this.getSchedule(this.week[0].date, this.week[this.week.length - 1].date);
  }

}
</script>
