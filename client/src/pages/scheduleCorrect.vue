<template>
  <div>
    <h1 class="text-2xl font-bold text-blue-800">Корректировки
      [<a href="#" @click="correctAll()">Исправить все</a>]
    </h1>
    <h2 class="text-xl font-bold text-blue-900">Смещения</h2>
    <div v-if="hasLogs">
      <template v-for="(row,ktp_id) in logs">
        <div v-if="row.errors.length>0">
          <h2 class="flex text-sky-900 font-bold">
            <a href="#" @click="correct(ktp_id)"
               title="Исправить для этой дисциплины"
               class="bg-cyan-200 border-cyan-600 border-2 rounded"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1/5"
                   stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008z"/>
              </svg>
            </a>
            КТП {{ row.name }} (ID: {{ ktp_id }})
          </h2>
          <div v-for="row in row.errors" class="bg-orange-300 text-orange-800 m-2 px-2 rounded-sm">
            {{ row.message }}
          </div>
        </div>
      </template>
    </div>
    <div v-else>Все в порядке</div>

    <h2 class="text-xl font-bold text-blue-900">Наложения</h2>
    <div v-if="hasOverlay">
      <template v-for="(groups,date) in overlay">
        <h3>Дата {{ date }}</h3>
        <div>
          <div v-for="(lessons,groupId) in groups">
            <div v-for="lesson in lessons" class="m-1 p-2 bg-orange-100 border border-orange-700 rounded-sm">
              <h4>Урок {{ lesson.lesson_number }}</h4>
              <div>
                <div v-for="ktp in lesson.ktps" class="bg-orange-300 border text-orange-800 m-1 p-2 rounded-sm">
                  {{ ktp.name }}
                  <a href="#" @click="clearOverlay(ktp.ids)"
                     class="text-red-800 font-bold border border-red-700 px-1.5 rounded bg-red-500">Х</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div v-else>Все в порядке</div>
  </div>
</template>

<script>
import axios from "axios";
import _ from 'lodash';

export default {
  name: "scheduleCorrect",
  data() {
    return {
      logs: [],
      overlay: [],
    }
  },
  computed: {
    hasLogs() {
      return this.logs && _.size(this.logs);
    }, hasOverlay() {
      return this.overlay && _.size(this.overlay);
    }
  },
  methods: {
    correct(ktpId) {
      if (confirm('Обновить расписание в соответствии с последовательностью?')) {
        this.showLoading();
        this.$axios.get('schedule/correct', {
          params: {
            ktpId: ktpId,
            correct: 1
          }
        }).then((res) => {
          this.hideLoading();
          this.updateList();
        })
      }
    },
    correctAll() {
      if (confirm('Это может быть долго и не контролируемо. продолжить?')) {
        this.showLoading();
        const ktpIds = Object.keys(this.logs);
        const correctFn = (ktpId) => {
          this.$axios.get('schedule/correct', {
            params: {
              ktpId: ktpId,
              correct: 1
            }
          }).then((res) => {
            const currIndex = ktpIds.indexOf(ktpId);
            if (currIndex === -1 || currIndex >= (ktpIds.length - 1)) {
              this.hideLoading();
              this.updateList();
              return;
            }
            correctFn(ktpIds[currIndex + 1])
          })
        }
        const firstKtpId = ktpIds[0];
        if (firstKtpId) {
          correctFn(firstKtpId);
        }

      }
    },
    updateList() {
      this.showLoading();
      this.$axios.get('schedule/correct', {}).then((res) => {
        this.logs = res.data.list;
        this.overlay = res.data.overlay;
        this.hideLoading();
      })
    },
    clearOverlay(ids) {
      if (confirm('Убрать эти пары на день-урок?')) {
        this.showLoading();
        this.$axios.get('schedule/correct-overlay', {
          params: {
            ids: ids
          }
        }).then((res) => {
          this.hideLoading();
          this.updateList();
        })
      }
    }
  },
  mounted() {
    this.updateList();
  }

}
</script>
