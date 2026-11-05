<script setup>
defineProps({rows: {type: Array, required: true}});
</script>
<template>
  <div class="overflow-x-auto">
    <h2 class="text-lg font-bold">Равномерность выдачи дисциплин</h2>
    <p v-if="!rows.length">Нет дисциплин по выбранным условиям.</p>
    <table v-else class="table w-full">
      <thead><tr><th>Группа / дисциплина</th><th>Семестр</th><th>Недель</th><th>Всего / выдано / остаток</th><th>Среднее в неделю</th><th>План завершённых недель</th><th>Отклонение, ч</th><th>Недельная выдача</th></tr></thead>
      <tbody><tr v-for="row in rows" :key="row.ktpId" :class="{'bg-orange-100': row.delta < 0 || row.warnings.length}">
        <td>{{ row.group }} — {{ row.subject }}<p v-for="warning in row.warnings" :key="warning" class="text-red-700">{{ warning }}</p></td>
        <td>{{ row.semester }}</td><td>{{ row.weeks }}</td><td>{{ row.total }} / {{ row.delivered }} / {{ row.remaining }}</td>
        <td>{{ row.average?.toFixed(2) ?? '—' }}</td><td>{{ row.expected }}</td><td>{{ row.delta > 0 ? '+' : '' }}{{ row.delta }}</td>
        <td><details><summary>План / выдано</summary>
          <p v-for="week in row.timeline" :key="week.week">Неделя {{ week.week }} ({{ week.start }}–{{ week.end }}): {{ week.target }} / {{ week.actual }} ч</p>
        </details></td>
      </tr></tbody>
    </table>
  </div>
</template>
