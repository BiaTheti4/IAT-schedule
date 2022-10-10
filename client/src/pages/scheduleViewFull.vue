<template>
  <div>
    <select
        class="border px-2 py-1 ml-2 rounded-md border-sky-700"
        @change="correctPath"
        v-model="selectedCourse">
      <option v-for="course in 5" :key="course" :value="course">
        {{ course }} курс
      </option>
    </select>

    <div class="grid grid-cols-8">
      <div class="col-span-6">
        <div class="my-auto text-center text-xl font-bold align-bottom ">Расписание занятий {{ selectedCourse }} курса
          на 1
          семестр
          2022-2023 учебного
          года
        </div>
      </div>
      <div class="col-span-2">
        У Т В Е Р Ж Д А Ю<br/>
        Директор ГБПОУИО "ИАТ" ____________ А.Н. Якубовский<br/>
        "_____" _______________ 2022 г.
      </div>
    </div>

    <table class="table-fixed border-collapse text-xs">
      <thead>
      <tr class="h-16">
        <th class="cell w-3" rowspan="2">
          <div class="-rotate-90">Время занятий</div>
        </th>
        <th class="cell rotated" rowspan="2">
          Дни недели
        </th>
        <th class="cell" rowspan="2">
          <div class="-rotate-90">Занятие</div>
        </th>
        <th class="cell" colspan="2"
            v-for="group in groupByCourse[selectedCourse]"
        >{{ group.name }}
        </th>
      </tr>
      <tr>
        <template v-for="group in groupByCourse[selectedCourse]">
          <th class="cell w-20">Предмет</th>
          <th class="cell w-8">Ауд</th>
        </template>
      </tr>
      </thead>
      <template v-for="(week,weekIndex) in weeks">
      <tbody class="redline">
        <template v-for="(lTime, lesson_number) in  lessonTime">
          <tr class="">
            <td class="cell">{{ lTime }}</td>
            <td class="cell rotated" v-if="lesson_number==0" rowspan="7">
              {{ week }}
            </td>
            <td class="cell">{{ lesson_number + 1 }}</td>
            <template v-for="group in groupByCourse[selectedCourse]">
              <td class="cell">{{ subjectName(group.id, weekIndex, lesson_number) }}</td>
              <td class="cell">{{ subjectCabinets(group.id, weekIndex, lesson_number) }}</td>
            </template>
          </tr>
        </template>
      </tbody>
      </template>
    </table>
  </div>
</template>

<script>
import DatesMixin from '../mixins/dates.mixin'
import GroupsMixin from "@/mixins/groups.mixin";
import ScheduleMixin from "@/mixins/schedule.mixin";
import ScheduleTable from "@/components/ScheduleTable";
import ScheduleTableCell from "@/components/ScheduleTableCell";
import {Tab} from "@headlessui/vue";
import LessonTime from "@/enums/LessonTime";
import moment from "moment";
import _ from "lodash";


export default {
  name: "scheduleViewFull",
  mixins: [DatesMixin, GroupsMixin, ScheduleMixin],
  components: {Tab, ScheduleTable, ScheduleTableCell},
  data() {
    return {
      dates: '',
      weeks: ['Понедельник', 'Втроник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      selectedCourse: 1
    }
  },
  computed: {
    lessonTime() {
      return LessonTime;
    }
  },
  methods: {
    correctPath() {
      this.$router.replace({name: "scheduleView", query: {group: this.selectedGroup}})
    },
    subjectName(groupId, week, lesson) {
      return this.getLessonByGroup(groupId, this.dates[week], lesson + 1).subject || "";
    },
    subjectCabinets(groupId, week, lesson) {
      return this.subjectCabinetCorrect(this.getLessonByGroup(groupId, this.dates[week], lesson + 1).cabinet || "");
    }
  },

  mounted() {
    let startDate = '2022-09-26';
    let date = moment(startDate)
    this.dates = [startDate];
    for (let i = 0; i < 6; i++) {
      this.dates.push(date.add(1, 'days').format('YYYY-MM-DD'))
    }
    this.selectedGroup = this.$route.query.group || ''
    this.fillWeek()
    this.initGroups();
    this.getSchedule(startDate, moment(startDate).add(6, 'days').format('YYYY-MM-DD'));
  }
}
</script>
<style scoped>
.cell {
  @apply border border-black;
}
.redline  {
  @apply border-y-2 border-y-red-800
}
.rotated {
  @apply -rotate-90 w-3 overflow-clip;
}
</style>
