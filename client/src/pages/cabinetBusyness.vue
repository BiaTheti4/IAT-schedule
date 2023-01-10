<template>
  <div>
    <div class="datePicker" id="content">
      <form>
        <select class="border px-2 py-1 ml-2 rounded-md border-sky-700" v-model="selectedCabinet">
          <option value="">Все кабинеты</option>
          <option v-for="cabinet in cabinets" :value="cabinet.id">
            {{ cabinet.number }}
          </option>
        </select>
      </form>
    </div>
    <template v-for="cabinet in cabinets">
      <div v-if="selectedCabinet==='' || +selectedCabinet===+cabinet.id" :key="'block-cabinet-'+cabinet.groupId">
        <h2 class="text-sky-900 pl-5 font-extrabold text-lg">Кабинет: {{ cabinet.number }}</h2>
        <div class="inline-block  shadow-lg">
          <schedule-table
              schedule-type="cabinet"
              :schedule-param="cabinet.id"
              :week-dates="week"
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
import CabinetsMixin from "@/mixins/cabinets.mixin";

export default {
  name: "cabinetBusyness",
  components: {ScheduleTable},
  mixins: [ScheduleMixin, DatesMixin, CabinetsMixin],
  data() {
    return {
      selectedCabinet: '',
    }
  },
  methods: {},

  mounted() {
    this.fillWeek();
    this.initCabinets();
    this.getSchedule(this.week[0].date, this.week[this.week.length - 1].date);
  },
}
</script>

<style scoped>
</style>