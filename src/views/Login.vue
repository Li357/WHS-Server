<template>
  <div class="login">
    <el-card class="login-card">
      <div slot="header">Login to WHS App Server</div>
      <el-alert v-if="error.length > 0" :title="error" type="error"></el-alert>
      <el-input class="login-input" placeholder="Username" v-model="username"></el-input>
      <el-input class="login-input" placeholder="Password" v-model="password" type="password"></el-input>
      <el-button class="login-button" type="primary" :disabled="!canLogin" @click="login">Login</el-button>
    </el-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import API from '../api-wrapper';

@Component({ name: 'login' })
export default class Home extends Vue {
  private username = '';
  private password = '';
  private error = '';
  private loading = false;

  get canLogin() {
    return this.username.length > 0 && this.password.length > 0 && !this.loading;
  }

  private async login() {
    this.loading = true;
    try {
      await API.login(this.username, this.password);
      this.$router.push('/');
    } catch ({ message }) {
      this.error = message;
    }
    this.loading = false;
  }
}
</script>

<style lang="stylus" scoped>
.login
  display flex
  justify-content center
  align-items center

  &-card
    min-width 300px
    max-width 400px

  &-input, &-button, & .el-alert--error
    margin-bottom 10px

  &-button
    width 100%
</style>
