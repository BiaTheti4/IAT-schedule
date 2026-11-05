<template>
  <div>
    <div class="datePicker" id="content">
      <form>
        <div class="flex" id="content">
          <div class="w-64 flex-initial">
            <Datepicker
              :modelValue="date"
              locale="ru-RU"
              :enableTimePicker="false"
              :disabledWeekDays="[0]"
              position="left"
              format="dd.MM.yyyy"
              :autoApply="true"
              :clearable="false"
              @update:modelValue="updateData"
            />
          </div>
          <select class="border px-2 py-1 ml-2 rounded-md border-sky-700" v-model="nowEmployee">
            <option value="">Все преподаватели</option>
            <option v-for="teacher in teachers" :value="teacher.id">
              {{ teacher.name }}
            </option>
          </select>

        </div>
      </form>
    </div>
    <template v-for="teacher in teachers">
      <div v-if="selectedEmployee === '' || +selectedEmployee === +teacher.id" :key="'block' + teacher.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">{{ teacher.name }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table schedule-type="employee" :schedule-param="teacher.id" :week-dates="week"/>
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
import moment from "moment/moment";

export default {
  name: "teacherBusyness",
  components: {ScheduleTable},
  mixins: [ScheduleMixin, DatesMixin, TeachersMixin],
  data() {
    return {
      selectedEmployee: '',
      date: moment().format('YYYY-MM-DD'),
    }
  },
  methods: {
    updateData(date) {
      date = moment(date || this.date);
      this.date = date.format('YYYY-MM-DD');
      this.fillWeek(date);

      this.getSchedule(date.format('YYYY-MM-DD'), date.clone().add(7, 'days').format('YYYY-MM-DD'));
    }
  },
  computed: {
    nowEmployee: {
      get() {
        return this.selectedEmployee;
      },
      set(value) {
        this.selectedEmployee = value;
        this.$cookies.set("selectedTeacher", value, '7d');
      }
    }
  },
  mounted() {
    if (this.$cookies.get("selectedTeacher")) {
      this.selectedEmployee = this.$cookies.get("selectedTeacher");
    }
    this.initEmployees();
    this.updateData();

  },
}
</script>

<style scoped></style>