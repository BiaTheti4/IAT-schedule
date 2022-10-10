<template>
  <div>
    <div class="flex print:hidden" id="content">
      <div class="w-32 flex-initial">
        <Datepicker
            :modelValue="date"
            locale="ru-RU"
            :enableTimePicker="false"
            :disabledWeekDays="[0]"
            position="left"
            format="dd.MM.yyyy"
            :autoApply="true"
            :clearable="false"
            @update:modelValue="changeDate"
        />
      </div>
    </div>
    <div class="container">
      <template v-for="course in 5">
        <div class="border-b-2 border-gray-800">
          <h1 class="text-center font-bold text-2xl pb-3 pt-4">
            Расписание на {{ getFullDate(date) }} {{ getWeekDayFull(date).toUpperCase() }} {{ course }} курс
          </h1>

          <table class="table-fixed border-collapse border border-slate-500  mb-10">
            <thead class="">
            <tr>
              <th class="tableHead"></th>
              <th class="tableHead w-5">Время</th>
              <template v-for="groupRow in groupByCourse[course]" :key="groupRow.id">
                <th class="tableHead">
                  {{ groupRow.name }}
                </th>
                <th class="tableHead">Каб</th>
              </template>
            </tr>
            </thead>
            <tbody>
            <tr v-for="lessonNumber in 7">
              <td class="tableCellFirst">{{ lessonNumber }}</td>
              <td class="tableCellFirst">{{ lessonTime[lessonNumber - 1] }}</td>
              <template v-for="groupRow in groupByCourse[course]"
                        :key="groupRow.id">
                <schedule-table-cell-print :schedule="getLessonByGroup(groupRow.id, date, lessonNumber)"/>
              </template>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="pagebreak" v-if="course>1 && course%2===0"></div>

      </template>
    </div>
  </div>
</template>

<script>
import DatesMixin from "@/mixins/dates.mixin";
import GroupsMixin from "@/mixins/groups.mixin";
import ScheduleMixin from "@/mixins/schedule.mixin";
import ScheduleTableCellPrint from "@/components/ScheduleTableCellPrint";
import LessonTime from "@/enums/LessonTime";
import moment from "moment/moment";


export default {
  name: "schedulePrint",
  mixins: [DatesMixin, GroupsMixin, ScheduleMixin, DatesMixin],
  components: {ScheduleTableCellPrint},
  data() {
    return {
      lessonTime: LessonTime,
      date: '',
      selectedGroup: ''
    }
  },
  methods: {
    correctPath() {
      this.$router.replace({name: "scheduleView", query: {group: this.selectedGroup}})
    },
    changeDate(date) {
      if (date === undefined) {
        date = new Date();
      }
      let dateString = moment(date).format('YYYY-MM-DD');
      this.date = dateString;
      this.getSchedule(dateString, dateString);
    }

  },


  mounted() {
    this.date = '2022-09-30';
    this.selectedGroup = this.$route.query.group || ''
    this.fillWeek()
    this.initGroups();
    this.getSchedule(this.date, this.date);
  }

}
</script>

<style scoped>
.pagebreak {
  clear: both;
  page-break-after: always;
}

.tableHead {
  @apply bg-sky-300 border border-sky-600 p-1;
}

.tableCellFirst {
  @apply border border-sky-700 p-1;
}

</style>