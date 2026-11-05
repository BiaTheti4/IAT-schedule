<script setup>
defineProps({rows: {type: Array, required: true}});
</script>
<template>
  <div class="overflow-x-auto">
    <h2 class="text-lg font-bold">Возможность завершить нагрузку преподавателей</h2>
    <p>Максимум — 7 пар × 2 часа в день, понедельник–суббота, в оставшиеся учебные недели.
      Дни разных групп считаются один раз. Проверяется суммарный остаток к каждому сроку.
      Это верхняя оценка: праздники, доступность преподавателя и конфликты расписания могут уменьшить возможности.
      Для ещё не назначенных занятий используются преподаватели КТП и замены на выбранную дату.</p>
    <p v-if="!rows.length">Остатков нагрузки нет.</p>
    <table v-else class="table w-full">
      <thead><tr><th>Преподаватель</th><th>Всего осталось, ч</th><th>Проверка сроков</th><th>Дисциплины</th></tr></thead>
      <tbody><tr v-for="row in rows" :key="row.id" :class="{'bg-red-100': row.alarm, 'bg-orange-100': row.unknown}">
        <td>{{ row.name }}<strong v-if="row.alarm" class="block text-red-700">Невозможно выдать в срок</strong>
          <p v-if="row.unknown">Для части нагрузки не определён учебный график</p></td>
        <td>{{ row.remaining }}</td>
        <td><p v-for="check in row.checks" :key="check.deadline">
          До {{ check.deadline }}: {{ check.remaining }} ч / максимум {{ check.capacity }} ч ({{ check.days }} дней).
          <strong v-if="check.deficit" class="text-red-700">Не хватает {{ check.deficit }} ч.</strong>
        </p></td>
        <td><details><summary>Остатки</summary><p v-for="task in row.tasks" :key="task.ktpId">{{ task.group }} — {{ task.subject }}: {{ task.hours }} ч; до {{ task.deadline || 'не определено' }}</p></details></td>
      </tr></tbody>
    </table>
  </div>
</template>
