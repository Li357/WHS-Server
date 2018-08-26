<template>
  <div id="not-found">
    <div>404 :(</div>
    <el-button type="text" @click="$router.push('/')">Back to safety</el-button>
  </div>
</template>

<script>
export default {
  name: 'not-found',
};
</script>

<style scoped>
#not-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 100px;
}

#not-found button {
  font-size: 25px;
}
</style>
