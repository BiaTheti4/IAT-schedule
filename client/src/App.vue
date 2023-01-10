<template>
  <loading
      v-model:active="isLoadingContent"
      :is-full-page="true"
  />
  <div class="container w-full">
    <navbar class="print:hidden h-16"/>
    <router-view class="mx-4 print:mx-0"></router-view>
  </div>
</template>
<script>

import navbar from "@/components/navbar";
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';
import {globalStore} from "@/store/gloabal";


export default {
  components: {
    navbar,
    Loading
  },
  created() {
    let store = globalStore();
    store.auth = localStorage['auth'] === 'true';
    store.user = localStorage['user'] || "";
    store.access_token = localStorage['access_token'] || "";
  }
}

</script>

<style scoped>

</style>