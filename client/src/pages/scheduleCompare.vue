<template>
  <div>
    <h1>Сравнение с журналом</h1>
    <template v-for="(row,ktp_id) in list">
      <h2 class="flex text-sky-900 font-bold">
        КТП {{ row.name }} (ID: {{ ktp_id }})
      </h2>
      <template v-for="dateRow in row.dates">
        <template v-for="row in dateRow">
          <div v-if="row.problem" class="bg-red-400 m-2 px-2 border-r-4">
            {{ row }}
          </div>
          <div v-else class="bg-green-500 m-2 px-2 border-r-4">
            Дата: {{ row.date }},
            Урок: {{ row.lesson_number }},
            Тема: {{ row.list_id }} (
            <span v-if="row.journal">{{ row.journal.listId }}</span>
            <span v-if="row.journal2">{{ row.journal2.listId }}</span>)
            {{row}}
          </div>
        </template>
      </template>
    </template>
  </div>

</template>

<script>
import ktp from "@/pages/ktp";

export default {
  name: "scheduleCompare",
  data() {
    return {
      list: [],
    }
  },
  methods: {
    updateList() {
      this.showLoading();
      this.$axios.get('schedule/compare', {}).then((res) => {
        this.list = res.data.list;
        this.hideLoading();
      })

    }
  },
  mounted() {
    this.updateList();
  }

}
</script>
