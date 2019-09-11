<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>
    </div>
    <div>
      <div>
        Home
        <div>Items: {{ items }}</div>
      </div>
    </div>
    <router-view />
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import commonModule from './store/modules/common/index';
const name = 'home';
export default {
  created: function() {
    const store = this.$store;
    // register a new module only if doesn't exist
    if (!(store && store.state && store.state[name])) {
      store.registerModule(name, commonModule);
    } else {
      // re-use the already existing module
      console.log(`reusing module: ${name}`);
    }
  },
  computed: {
    // map the state from the given namespace
    ...mapState(name, {
      items: state => state.items
    })
  },
  methods: {
    // map actions from the given namespace
    ...mapActions(name, ['generate'])
  },
  mounted: function() {
    this.generate();
  }
};
</script>
<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /*color: #2c3e50;*/
  color: $blue;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
