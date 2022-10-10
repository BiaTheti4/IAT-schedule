<template>
  <navbar class="print:hidden"/>
  <loading v-model:active="isLoading"
           :is-full-page="true"/>
  <div class="container mt-14">
    <router-view></router-view>
  </div>
</template>
<script>

import navbar from "@/components/navbar";
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {

  components: {
    navbar,
    Loading
  }
}

</script>

<style scoped>

</style>