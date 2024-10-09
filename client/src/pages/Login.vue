<template>
  <div>
    <section class="min-h-screen flex justify-center items-center">
      <div class="w-full max-w-md p-8 bg-white border border-gray-300 rounded-lg shadow-lg">
        <form @submit.prevent="login" @keydown.enter="login">
          <!-- Email input -->
          <div class="mb-6">
            <input
                type="text"
                class="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                v-model="username"
                autocomplete="username"
                placeholder="Логин"
                ref="usernameField"
            />
            <span class="text-red-800" v-if="errors.username">{{ errors.username }}</span>
          </div>

          <!-- Password input -->
          <div class="mb-6">
            <input
                type="password"
                class="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                v-model="password"
                autocomplete="current-password"
                placeholder="Пароль"
            />
            <span class="text-red-800" v-if="errors.password">{{ errors.password }}</span>
          </div>

          <!-- Button -->
          <div class="text-center">
            <input
                type="button"
                value="Войти"
                class="inline-block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                @click="login"
            /> <input
              type="button"
              value="Отмена"
              class="inline-block text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              @click="toMain"
          />
          </div>
        </form>
      </div>
    </section>
  </div>
</template>


<script>
import _ from 'lodash'
import scheduleView from "@/pages/scheduleView.vue";

export default {
  data() {
    return {
      username: '',
      password: '',
      errors: {
        username: false,
        password: false,
      },

    }
  },

  methods: {
    async login() {
      let params = {
        username: this.username,
        password: this.password
      }

      if (!params.username) {
        this.errors.username = 'Укажите имя пользователя'
      } else {
        this.errors.username = false;
      }
      if (!params.password) {
        this.errors.password = 'Укажите пароль'

      } else {
        this.errors.password = false;
      }
      if (!(this.errors.password === false && this.errors.username === false)) {
        return false;
      }
      try {
        let result = await this.$axios.post('auth/login', params);
        if (result.data.success === true) {
          this.setAuth(result.data.token);
          this.$router.push({name: 'scheduleMain'})
        } else {
          this.setAuth('');
          this.errors.password = 'Неверный логин или пароль'
        }
      } catch (e) {
        if (e.response && _.get(e.response, 'data.success', null) === false) {
          this.setAuth('');
          this.errors.password = _.get(e.response, 'data.message', 'Неверный логин или пароль')
        } else {
          this.setAuth('');
          this.errors.password = 'Неопознанная ошибка.'
        }
      }
    },
    toMain() {
      this.$router.push('/')
    },
    checkStatus() {

    }
  },


}


</script>

<style scoped>

</style>