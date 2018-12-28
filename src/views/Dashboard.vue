<template>
  <div id="dashboard">
    <el-container class="dashboard-container">
      <el-header class="dashboard-header">
        Dashboard
        <el-button class="logout" type="text" @click="logout">Log out</el-button>
      </el-header>
      <el-container>
        <el-aside class="dashboard-navbar" width="20%">
          <el-menu
            class="dashboard-navbar-list" unique-opened
            :default-active="`${startYear}-${dateTypeId}`"
          >
            <el-submenu v-for="year in years" :key="year" :index="`${year}`">
              <template slot="title">{{ year }} - {{ year + 1 }}</template>
              <el-menu-item
                v-for="(dateType, typeId) in dateTypes"
                :key="dateType" :index="`${year}-${typeId}`"
                @click="$router.push(`/dashboard/${year}/${typeId}`)"
              >{{ dateType }}</el-menu-item>
            </el-submenu>
          </el-menu>
          <year-settings :year="startYear"></year-settings>
        </el-aside>
        <router-view></router-view>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import YearSettings from '@/components/YearSettings.vue';
import { dateTypes, deleteCookie } from '@/utils';

export default {
  name: 'dashboard',
  props: ['startYear', 'dateTypeId'],
  data: () => ({
    dateTypes,
    years: Array(5)
      .fill(new Date().getFullYear())
      .map((year, index) => year + index),
  }),
  components: { YearSettings },
  methods: {
    logout() {
      deleteCookie('payload');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
#dashboard {
  display: flex;
}

.dashboard-container {
  display: flex;
}

.dashboard-header {
  display: flex;
  align-items: center;
  font-size: 25px;
  font-weight: bold;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
}

.dashboard-navbar {
  background-color: rgba(0, 0, 0, .04);
}

.dashboard-navbar-list {
  background-color: unset;
}

.logout {
  margin-left: auto;
}
</style>
