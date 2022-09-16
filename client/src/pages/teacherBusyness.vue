<template>
  <div>
    <div class="datePicker" id="content">
      <form>
        <select class="border px-2 py-1 ml-2 rounded-md border-sky-700" v-model="selectedEmployee">
          <option value="">Все преподаватели</option>
          <option v-for="teacher in teachers" :value="teacher.id">
            {{ teacher.name }}
          </option>
        </select>
      </form>
    </div>
    <template v-for="teacher in teachers">
      <div v-if="selectedEmployee==='' || +selectedEmployee===+teacher.id" :key="'block'+teacher.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">{{ teacher.name }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table
              schedule-type="employee"
              :schedule-param="teacher.id"
              :week="week"
          />
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import ScheduleTable from "@/components/ScheduleTable";
  import ScheduleMixin from "@/mixins/schedule.mixin";
  import DatesMixin from "@/mixins/dates.mixin";
  import TeachersMixin from "@/mixins/teachers.mixin";

  export default {
    name: "teacherBusyness",
    components: {ScheduleTable},
    mixins: [ScheduleMixin,DatesMixin, TeachersMixin],
    data() {
      return {
        selectedEmployee: '',
      }
    },
    methods: {

    },
    computed: {
    },
    mounted() {
      this.fillWeek();
      this.initEmployees();
      this.getSchedule(this.week[0].date, this.week[this.week.length - 1].date);


    },
}
</script>

<style scoped>
</style>