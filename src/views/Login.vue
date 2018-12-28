<template>
  <div id="login">
    <el-card class="login-card">
      <div slot="header">Login to WHS App Server</div>
      <el-alert v-if="error.length > 0" :title="error" type="error"></el-alert>
      <el-input placeholder="Username" v-model="username" class="login-input"></el-input>
      <el-input
        type="password" placeholder="Password" class="login-input"
        v-model="password"
      ></el-input>
      <el-button
        class="login-input login-button" type="primary"
        :disabled="!canLogin" @click="login"
      >Login</el-button>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'login',
  data: () => ({
    username: '',
    password: '',
    error: '',
  }),
  methods: {
    async login() {
      try {
        const loginRes = await fetch('/api/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });
        const { auth } = await loginRes.json();
        if (auth) {
          const currentYear = new Date().getFullYear();
          this.$router.push(`/dashboard/${currentYear}/1`);
          return;
        }

        throw new Error('Your username or password was incorrect');
      } catch ({ message }) {
        this.error = message;
      }
    },
  },
  computed: {
    canLogin() {
      return [this.username, this.password].every(({ length }) => length > 0);
    },
  },
};
</script>

<style scoped>
#login {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 50%;
  max-width: 500px;
}

.login-card * {
  margin-bottom: 15px;
}

.login-button {
  float: right;
}
</style>
