<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <el-button>按钮</el-button>
<!--    <HelloWorld msg="Welcome to Your Vue.js App" />-->
    <img  src="../../public/static/images/miaodou.png" alt="">
    <img class="big-img" src="../../public/static/images/th.jpg" alt="">
    <img class="big-img" src="/static/images/th.jpg" alt="">
    <NavShop />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue';
import NavShop from '../assets/images/svg/NavShop.svg';

export default {
  name: 'Home',
  components: {
    // HelloWorld,
    NavShop,
  },
  methods: {
    getNew() {
      console.log(1);
    }
  }
};
</script>
<style scoped>
  .big-img{
    width: 100%;
  }
</style>
