<template>
  <input type="checkbox" @change="sendInfo" value="test">
  <input type="text" v-model="testText">
  <input type="number" v-model="testId">
  {{ this.arr }}
</template>

<script>
import axios from "axios";

export default {
  name: "test",
  data() {
    return {
      arr: [],
      testText: '',
      testId: null,
    }
  },
  methods: {
    sendInfo() {
      this.$axios.patch("http://10.100.3.235:5000/test", {
        text: this.testText,
        id: this.testId,
        status: '1'
      }).then((res) => {
        this.arr.push(res.data)
      })
    }
  }
}


</script>

<style scoped>

</style>