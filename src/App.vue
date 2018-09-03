<template>
  <div id="app">
    <router-view class="app-route" />
  </div>
</template>

<script>
export default { name: 'app' };
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
