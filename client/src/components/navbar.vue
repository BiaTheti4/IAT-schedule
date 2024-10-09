<template>
  <div>
    <nav v-if="shouldShowNavbar" class="bg-gray-800 p-2 mt-0 fixed w-full z-10 top-0">
      <div class="container flex flex-no-wrap items-start">
        <div class="flex w-full justify-between">
          <ul class="list-reset flex justify-between flex-1 md:flex-none items-center">
            <li class="mr-3">
              <router-link
                  v-for="link in filteredNavList"
                  class="inline-block px-4 text-gray-300 no-underline"
                  :to="link.link">
                {{ link.title }}
              </router-link>
            </li>
            <li><a href="https://lk.irkat.ru" class="inline-block px-4 text-white no-underline">Личный кабинет
              студента</a></li>
            <li><a href="https://irkat.ru" class="inline-block px-4 text-white no-underline">Официальный сайт</a></li>
            <li v-if="canAuth">
              <a v-if="isAuth" href="#" @click="logout" class="inline-block px-4 text-white no-underline">
                Выход
              </a>
              <router-link v-else :to="{ name: 'login' }" class="inline-block px-4 text-white no-underline">
                Вход
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>
<script>
import {globalStore} from "@/store/global";
import ipRangeCheck from 'ip-range-check'

export default {

  data() {
    return {
      ip: ''
    };
  },

  computed: {

    isAuth() {
      const store = globalStore()
      return store.auth;
    },
    canAuth() {
      return ipRangeCheck(this.ip, ['127.0.0.1/24', '10.100.0.0/16']);
    },
    shouldShowNavbar() {
      return (this.isAuth || this.$route.meta.isPublic) && this.$route.name !== 'login';
    },

    navList() {
      return [
        {link: '/schedule', title: 'Расписание', isPublic: false},
        {link: '/', title: 'Просмотр расписания', isPublic: true},
        {link: '/teachers', title: 'Занятость преподавателей', isPublic: true},
        {link: '/cabinets', title: 'Занятость кабинетов', isPublic: true},
        {link: '/print', title: 'Печать расписания', isPublic: false},
        {link: '/schedule-correct', title: 'Исправления', isPublic: false},
        {link: '/schedule-compare', title: 'DEBUG', isPublic: false},
      ];
    },
    filteredNavList() {
      return this.navList.filter(link => this.isAuth || link.isPublic);
    }
  },

  methods: {
    logout() {
      this.setAuth('', '');
      this.$router.push({name: 'login'});
    },
    checkIp() {
      this.$axios.get('auth/ip').then(res => {
        this.ip = res.data.ip || false;
      })

    }
  },

  mounted() {
    this.checkIp();
  }

}
</script>

<style scoped>
.router-link-active {
  @apply font-medium text-white;
}
</style>
