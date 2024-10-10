<template>
  <div>
    <nav class="bg-gray-900 border-gray-700">
      <div class="max-w-screen-xl flex flex-wrap items-start justify-start p-4">
        <button data-collapse-toggle="navbar-menu" type="button"
                @click="toggleMenu()"
                class="inline-flex items-start p-2 w-10 h-10 justify-start text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
                aria-controls="navbar-multi-level" aria-expanded="false">
          <span class="sr-only">Меню</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>
        <div :class="{
          'block': collapsed,
          'hidden':!collapsed,
           'w-full': true,
           'md:block':true,
            'md:w-auto':true,
             'z-30':true
        }" id="navbar-menu">
          <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-gray-800 md:bg-gray-900 border-gray-700">
            <li v-for="link in filteredNavList">
              <router-link
                  class="nav-element"
                  @click="hideMenu()"
                  :to="link.link">
                {{ link.title }}
              </router-link>
            </li>
            <li><a href="https://lk.irkat.ru" class="nav-element">Личный кабинет</a></li>
            <li><a href="https://irkat.ru" class="nav-element">Сайт</a></li>
            <li v-if="canAuth">
              <a v-if="isAuth" href="#" @click="logout" class="nav-element">
                Выход
              </a>
              <router-link v-else :to="{ name: 'login' }" class="nav-element">
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
      ip: '',
      collapsed: false
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
        {link: '/schedule', title: 'Управление', isPublic: false},
        {link: '/', title: 'Расписание', isPublic: true},
        {link: '/teachers', title: 'По преподавателям', isPublic: true},
        {link: '/cabinets', title: 'По кабинетам', isPublic: true},
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
    toggleMenu() {
      this.collapsed = !this.collapsed;
    },
    hideMenu() {
      this.collapsed = false;
    },
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

.nav-element {
  @apply block py-2 px-3 text-white rounded md:p-0 md:bg-transparent;
}

</style>
