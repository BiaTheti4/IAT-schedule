<template>
  <div>
    <nav v-if="isAuth" class="bg-gray-800 p-2 mt-0 fixed w-full z-10 top-0">
      <div class="container flex flex-no-wrap items-start">
        <div class="flex w-full justify-between">
          <ul class="list-reset flex justify-between flex-1 md:flex-none items-center">
            <li class="mr-3">
              <router-link
                  v-for="link in navList"
                  class="inline-block px-4 text-white no-underline"
                  :to="link.link">
                {{ link.title }}
              </router-link>
            </li>
            <li>
              <a href="#" @click="logout"
                 class="inline-block px-4 text-white no-underline"
              >
                Выход
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>
<script>
import {globalStore} from "@/store/gloabal";
import {computed} from "vue";


export default {

  computed: {

    isAuth() {
      const store = globalStore()

      return store.auth;
    },

    navList() {
      return [
        {link: '/', title: 'Расписание'},
        {link: '/schedule', title: 'Просмотр расписания'},
        {link: '/teachers', title: 'Занятость преподавателей'},
        {link: '/cabinets', title: 'Занятость кабинетов'},
        {link: '/print', title: 'Печать расписания'},
        {link: '/schedule-correct', title: 'Исправления'},
        {link: '/schedule-compare', title: 'DEBUG'},
      ];
    }
  },

  methods: {
    logout() {
      this.setAuth('', '');
      this.$router.push({name: 'login'});
    }
  }

}
</script>

