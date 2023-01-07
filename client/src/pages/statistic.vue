<template>
  <div>
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
  name: "statistic",
  data() {
    return {
      statistic: {}
    }
  },
  methods: {
    loadStatistic() {
      this.$axios.get('statistic').then((response) => {
        this.statistic = response.data.statistic || {};
      }).rejects((error) => {
        alert(error);
      });
    }
  },


  mounted() {
    this.loadStatistic();
  }

}
</script>
