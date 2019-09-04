<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <NavShop />
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import NavShop from '../assets/images/svg/NavShop.svg';

export default {
  name: 'Home',
  components: {
    HelloWorld,
    NavShop
  },
  methods: {
    getNew() {
      console.log(1);
    }
  }
};
</script>
