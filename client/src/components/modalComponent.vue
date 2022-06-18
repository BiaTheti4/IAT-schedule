<template>
  <div>
    <!--        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Корзина {{basketCount}}</button>-->
    <!-- Button trigger modal -->
    <div id="openModal" class="modalDialog">
      <div>
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLiveLabel">Уведомление</h5>
          <a href="#close" type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </a>
        </div>
        <div class="modal-body">
          <p>{{ this.modalProp }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" @click="agreeModal()" class="btn btn-light">ДА</button>
          <button type="button" class="btn btn-secondary" @click="close()" data-dismiss="modal">Нет</button>
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

.count {
  background: #f8463f;
  border-radius: 100%;
  width: 18px;
  height: 18px;
  display: block;
  font-size: 11px;
  color: #fff;
  line-height: 18px;
  text-align: center;
  position: absolute;
  margin-left: 62px;
  margin-top: -37px;
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
  border-radius: .3rem;
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
}
</style>