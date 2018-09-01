<template>
  <el-container>
    <el-header class="year-header">
      2018 Settings
      <el-button icon="el-icon-edit" type="text">Edit</el-button>
    </el-header>
    <el-main>
      <el-row>Semester One Start: <span>Test</span></el-row>
      <el-row>Semester Two Start: <span>Test</span></el-row>
      <el-row>Last Day: <span>Test</span></el-row>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'year-settings',
};
</script>

<style scoped>
.year-header {
  display: flex;
  align-items: center;
  font-size: 25px;
  font-weight: bold;
}

.year-header button {
  margin-left: auto;
}

.el-row {
  margin-bottom: 10px;
  font-weight: bold;
}

.el-row span {
  float: right;
  font-weight: normal;
}
</style>
