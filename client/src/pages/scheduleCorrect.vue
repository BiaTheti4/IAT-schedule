<template>
  <div>


  </div>

</template>

<script>
import axios from "axios";

export default {
  name: "scheduleCorrect",
  data() {
    return {}
  },
  methods: {},
  mounted() {
    axios.get(this.serverUrl + '/api/schedule/correct', {}).then((res) => {
      window.debugVar = res.data;
    })
  }

}
</script>
