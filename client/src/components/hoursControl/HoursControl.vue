<script setup>
import {useHoursControl} from '@/composables/useHoursControl';
import SubjectHours from './SubjectHours.vue';
import TeacherCapacity from './TeacherCapacity.vue';
const {date, search, report, subjects, loading, error} = useHoursControl();
</script>
<template>
  <section class="p-4 space-y-4">
    <h1 class="text-xl font-bold">Контроль выдачи часов</h1>
    <div class="flex gap-4 flex-wrap">
      <label>На конец даты <input type="date" v-model="date" class="border p-2" /></label>
      <label>Группа / дисциплина <input v-model="search" type="search" class="border p-2" /></label>
      <router-link to="/schedule" class="btn btn-blue">Управление расписанием</router-link>
    </div>
    <p>Выдано — часы расписания по выбранную дату включительно. Будущие занятия входят в остаток.
      Недели учебной и производственной практики отведены только практике: 36 часов в неделю.
      Остальные дисциплины распределяются по теоретическим неделям парами по 2 часа; отклонение сравнивается по завершённым учебным неделям.</p>
    <p v-if="loading" role="status">Расчёт…</p>
    <p v-else-if="error" role="alert" class="text-red-700">{{ error }}</p>
    <template v-else-if="report">
      <p>Учебный год: {{ report.year }}–{{ report.year + 1 }}. Дисциплин: {{ subjects.length }}.</p>
      <SubjectHours :rows="subjects" />
      <TeacherCapacity :rows="report.teachers" />
    </template>
  </section>
</template>
