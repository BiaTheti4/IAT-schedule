<template>
  <div>
    <nav class="navbar">
      <group_first class="group_first">
        <router-link class="links" to="/">Расписание</router-link>
        <router-link class="links" to="/teachers">Преподаватели</router-link>
        <router-link class="links" to="/cabinets">Кабинеты</router-link>
        <router-link class="links" to="/groups">Учебные группы</router-link>
        <router-link class="links" to="/ktp">Учебная программа</router-link>
        <router-link class="links" to="/schedule">Просмотр расписания</router-link>
        <router-link class="links" to="/print">Печать расписания</router-link>
      </group_first>
      <!--      <group_second  class="group_second">-->
      <!--        <router-link class="links" to="/login">Авторизация</router-link>-->
      <!--      </group_second>-->
    </nav>
  </div>
</template>

<script>
export default {
  name: "nav-bar"
}
</script>

<style scoped>
.navbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background: #d9edf7;
  margin-right: 10px;
  margin-bottom: 20px;


}

.group_first {
  display: flex;
  flex-direction: row;

  background: #D9EDF7;
  align-items: center;
}

.group_second {
  display: flex;
  flex-direction: row;
  margin-right: 20px;
  background: #294A70;
}

.links {

  padding: 10px 15px;
  background: none;
  border-color: #8cedff;
  color: black;
  margin-left: 10px;
  text-decoration: none
}

.links:hover {
  transition: 0.3s;
  background: #7ac3ee;
}
</style>