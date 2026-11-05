<template>
  <div>
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
        <select class="border px-2 py-1 ml-2 rounded-md border-sky-700" v-model="selectedCabinet">
          <option value="">Все кабинеты</option>
          <option v-for="cabinet in cabinets" :value="cabinet.id">
            {{ cabinet.number }}
          </option>
        </select>
      </div>
    </form>
    <template v-for="cabinet in cabinets">
      <div v-if="selectedCabinet === '' || +selectedCabinet === +cabinet.id" :key="'block-cabinet-' + cabinet.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">Кабинет: {{ cabinet.number }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table schedule-type="cabinet" :schedule-param="cabinet.id" :week-dates="week"/>

        </div>
      </div>
    </template>

  </div>
</template>

<script>
import ScheduleTable from "@/components/ScheduleTable";
import ScheduleMixin from "@/mixins/schedule.mixin";
import DatesMixin from "@/mixins/dates.mixin";
import CabinetsMixin from "@/mixins/cabinets.mixin";
import GroupsMixin from "@/mixins/groups.mixin";
import moment from "moment";

export default {
  name: "cabinetBusyness",
  components: {ScheduleTable},
  mixins: [ScheduleMixin, DatesMixin, CabinetsMixin, GroupsMixin],
  data() {
    return {
      selectedCabinet: '',
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
  mounted() {
    if (this.$cookies.get("selectedCabinet")) {
      this.selectedCabinet = this.$cookies.get("selectedCabinet");
    }
    this.initCabinets();
    this.updateData(this.date);
  },
}
</script>

<style scoped></style>
