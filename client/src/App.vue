<template>
  <navbar></navbar>
  <div class="app">
    <router-view></router-view>
  </div>
</template>
<script>

import navbar from "@/components/navbar";

export default {
  components:{
    navbar,

  }
}

</script>

<style scoped>
* {
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400&display=swap');
  font-family: 'Source Sans 3', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body{
  margin:0;
  padding:0;

}
.app {
  padding: 0px;
}
</style>