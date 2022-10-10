<template>
  <div>
    <h1>Корректировки</h1>
    <template v-for="(row,ktp_id) in logs">
      <div v-if="row.errors.length>0">
        <h2 class="text-sky-900 font-bold">КТП {{ row.name }} (ID: {{ ktp_id }})</h2>
        <div v-for="row in row.errors" class="bg-orange-300 text-orange-800 m-2 px-2 border-r-4">
          {{ row.message }}
        </div>
      </div>
    </template>
  </div>

</template>

<script>
import axios from "axios";

export default {
  name: "scheduleCorrect",
  data() {
    return {
      logs: [],
    }
  },
  methods: {},
  mounted() {
    this.showLoading();
    axios.get(this.serverUrl + '/api/schedule/correct', {}).then((res) => {
      this.logs = res.data.list;
      this.hideLoading();
    })
  }

}
</script>
