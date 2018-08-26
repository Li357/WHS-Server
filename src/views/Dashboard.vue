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
            :default-active="`${selectedYear}-${dateTypes[0]}`"
          >
            <el-submenu v-for="year in years" :key="year" :index="`${year}`">
              <template slot="title">
                {{ year }} - {{ year + 1 }}
              </template>
              <el-menu-item
                v-for="type in dateTypes" :key="type" :index="`${year}-${type}`"
                @click="setSelection(year, type)"
              >
                {{ type }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <date-list :dates="fetchedDates" :year="selectedYear" :type="selectedType">
        </date-list>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import DateList from '@/components/DateList.vue';

const currentYear = new Date().getFullYear();
const dateTypes = ['Assembly', 'No School', 'Late Start', 'Early Dismissal'];

export default {
  name: 'dashboard',
  data: () => ({
    dateTypes,
    years: Array(5)
      .fill(currentYear)
      .map((year, index) => year + index),
    selectedYear: currentYear,
    selectedType: dateTypes[0],
    fetchedDates: [],
  }),
  components: { DateList },
  methods: {
    logout() {
      localStorage.removeItem('jwt');
      this.$router.push('/login');
    },
    setSelection(year, type) {
      this.selectedYear = year;
      this.selectedType = type;
    },
  },
  created() {

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
