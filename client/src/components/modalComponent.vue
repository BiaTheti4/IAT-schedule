<template>
  <div>
    <!--        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Корзина {{basketCount}}</button>-->
    <!-- Button trigger modal -->
    <div id="openModal" class="modalDialog">
      <div>
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLiveLabel">Конфликт кабинетов/преподавателей</h5>
          <a @click="close()" type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </a>
        </div>
        <div class="modal-body">
В расписание присутствуют конфликты
        </div>
        <div class="modal-footer">
          <button type="button" @click="agreeModal()" class="button">Сохранить</button>
          <button type="button" class="button" @click="close()" data-dismiss="modal">Отмена</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {

  name: "modalComponent",
  methods: {
    close() {
      this.$emit('result', 0);
    },
    agreeModal() {
      this.$emit('result', 1);
    },

  }
}
</script>

<style scoped>
a.disabled {
  pointer-events: none; /* делаем ссылку некликабельной */
  cursor: default; /* устанавливаем курсор в виде стрелки */
  color: #999; /* цвет текста для нективной ссылки */
}
.modal-header{

  padding: 1px 15px;
  background-color: #d9edf7;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}
.modal-title{

}
.modal-body{
  padding-top: 50px;
  padding-bottom: 50px;
  padding-left: 15px;
}

.modal-footer{
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
padding-left: 10px;
  padding-bottom: 15px;
}
.button{
  background-color: #0095ff;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: rgba(255, 255, 255, .4) 0 1px 0 0 inset;
  box-sizing: border-box;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-family: -apple-system, system-ui, "Segoe UI", "Liberation Sans", sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.15385;
  margin: 0 0 0 5px;
  outline: none;
  padding: 8px .8em;
  position: relative;
  text-align: center;
  text-decoration: none;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  vertical-align: baseline;
  white-space: nowrap;
}

.modalDialog {
  position: fixed;
  font-family: Arial, Helvetica, sans-serif;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 99999;
  -webkit-transition: opacity 400ms ease-in;
  -moz-transition: opacity 400ms ease-in;
  transition: opacity 400ms ease-in;
  display: block;
  pointer-events: auto;
  overflow: auto;

}

.modalDialog:target {
  display: block;
  pointer-events: auto;
}

.modalDialog > div {
  width: 700px;
  position: relative;
  margin: 10% auto;
  border-radius: 15px;
  background: #fff;
  background: -moz-linear-gradient(#fff, #999);
  background: -webkit-linear-gradient(#fff, #999);
  background: -o-linear-gradient(#fff, #999);
}

.close {
  line-height: 25px;
  position: absolute;
  right: 16px;
  text-align: center;
  top: 17px;
  text-decoration: none;
  font-weight: 100;
  color: #000;
  font-size: 26px;
  cursor: pointer;
}
.modal-footer >button{
  margin-right: 30px;
}
</style>