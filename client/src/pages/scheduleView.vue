<template>
  <div>
    <div class="flex">
      <div class="w-64 flex-initial">
        <Datepicker
            :modelValue="date"
            class="border-sky-700"
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
      <div class="datePickerChild">
        <select class="border px-2 py-1 ml-2 rounded-md border-sky-700"
                @change="correctPath"
                v-model="selectedGroup">
          <option value="" selected>Все группы</option>
          <option disabled>1 курс</option>
          <option v-for="group in groupByCourse[1]" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
          <option disabled>2 курс</option>
          <option v-for="group in groupByCourse[2]" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
          <option disabled>3 курс</option>
          <option v-for="group in groupByCourse[3]" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
          <option disabled>4 курс</option>
          <option v-for="group in groupByCourse[4]" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>
          <option disabled>5 курс</option>
          <option v-for="group in groupByCourse[5]" :key="group.id" :value="group.id">
            {{ group.name }}
          </option>

<!--          <option v-for="group in groups" :key="group.groupId" :value="group.groupId">-->
<!--                      {{ group.name }}-->
<!--                      </option>-->
        </select>
      </div>
    </div>


    <template v-for="group in groups">
      <div v-if="selectedGroup==='' || +selectedGroup===+group.groupId" :key="group.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">{{ group.name }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table
              schedule-type="group"
              :schedule-param="group.groupId"
              :week-dates="week"
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
import moment from "moment/moment";

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
    changeDate(date) {
      if (date === undefined) {
        date = new Date();
      }
      this.date = moment(date).format('YYYY-MM-DD');
      this.updateSchedule(date);
    },
    updateSchedule(date) {
      this.fillWeek(date)
      this.getSchedule(this.week[0].date, this.week[this.week.length - 1].date);
    }
  },


  mounted() {
    this.date = new Date();
    this.selectedGroup = this.$route.query.group || ''
    this.initGroups();
    this.updateSchedule();


  }

}
</script>
