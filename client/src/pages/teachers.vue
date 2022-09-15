<template>
  <div>
    <table class="border-collapse border border-slate-500 rounded-sm">
      <thead class="thead_items">
      <tr>
        <th class="bg-sky-300 border border-sky-600 p-1">ФИО преподавателя</th>
        <th class="bg-sky-300 border border-sky-600 p-1">Преподаваемые дисциплины</th>
        <th class="bg-sky-300 border border-sky-600 p-1">Статус дееспособности</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="teacher in teachers" :key="teacher">
        <td class="bg-sky-100 border border-sky-600 p-1">{{ teacher.name }}</td>
        <td>
          Дисцилпина_name
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" @change="updateStatusTeacher(teacher.id,teacher.status,teacher.name)"
                   v-model="teacher.status">
            <span class="slider"></span>
          </label>
          {{ checkStatus(teacher.status) }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      teachers: [],
    }
  },
  methods: {
    updateStatusTeacher(teacherId, teacherStatus) {
      axios.patch("http://localhost:5000/patchTeacher", {
        id: teacherId,
        status: teacherStatus
      }).then((res) => {
        console.log(res.data)
      })
    },

    checkStatus(status) {
      return (status == 1) ? 'Работает' : 'Болеет'
    }
  },


  mounted() {
    axios.get('http://localhost:5000/teachersList').then(res => {
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].status = (res.data[i].status == 1) ? true : false
      }

      this.teachers = res.data
    })
  }
}


</script>

<style scoped>
.table {
  border: 1px solid #eee;
  table-layout: fixed;
  width: 100%;
  margin-bottom: 20px;
  margin-top: 20px;
}

input[type="checkbox"]:checked {
  background: darkgreen;
}

input[type="checkbox"] {
  background: darkgreen;
}

.table {
  width: 100%;
  border: none;
  margin-bottom: 20px;
  border-collapse: separate;

}

.table thead th {
  font-weight: bold;
  text-align: left;
  border: none;
  padding: 10px 15px;
  background: #D9EDF7;
  font-size: 14px;
  border-top: 1px solid #ddd;
}

.table tr th:first-child, .table tr td:first-child {
  border-left: 1px solid #ddd;
}

.table tr th:last-child, .table tr td:last-child {
  border-right: 1px solid #ddd;
}

.table thead tr th:first-child {
  border-radius: 20px 0 0 0;
}

.table thead tr th:last-child {
  border-radius: 0 20px 0 0;
}

.table tbody td {
  text-align: left;
  border: none;
  padding: 10px 15px;
  font-size: 14px;
  vertical-align: top;
}

.table tbody tr:nth-child(even) {
  background: #F8F8F8;
}

.table tbody tr:last-child td {
  border-bottom: 1px solid #ddd;
}

.table tbody tr:last-child td:first-child {
  border-radius: 0 0 0 20px;
}

.table tbody tr:last-child td:last-child {
  border-radius: 0 0 20px 0;
}

.checked {

}


.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>