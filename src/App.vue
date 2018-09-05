<template>
  <div id="app">
    <loading v-if="loading"></loading>
    <router-view v-else class="app-route"></router-view>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import Loading from '@/views/Loading.vue';

export default {
  name: 'app',
  components: { Loading },
  computed: mapState(['loading']),
};
</script>

<style>
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  flex: 1;
}

.app-route {
  width: 100%;
  height: 100%;
}
</style>
