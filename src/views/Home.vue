<template>
  <div class="home">
    <img src="/static/images/miaodou.png" alt="" />
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  methods: {
    getCode() {
      console.log(1);
    }
  }
};
</script>
