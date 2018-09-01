<template>
  <div class="date-list">
    <el-container>
      <el-header class="date-list-header" height="75px">
        {{ startYear }} - {{ startYear + 1 }} {{ dateType }} Dates
        <el-button
          class="date-list-add" type="primary" icon="el-icon-plus"
          @click="addingDate = true" round
        >Add Date</el-button>
        <el-button
          type="danger" icon="el-icon-check"
          @click="saveDates" :disabled="savingDates" round
        >Save Dates</el-button>
        <add-date-dialog :adding-date="addingDate" @add="addDate" @close="addingDate = false">
        </add-date-dialog>
      </el-header>
      <el-table :data="dates" empty-text="No dates" v-loading="savingDates || loadingDates">
        <el-table-column prop="date" label="Date"></el-table-column>
        <el-table-column prop="comment" label="Comment"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button
              type="danger" size="mini" icon="el-icon-delete"
              @click="removeDate(scope.$index)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-container>
  </div>
</template>

<script>
import moment from 'moment';

import AddDateDialog from '@/components/AddDateDialog.vue';
import { dateTypes } from '@/utils';

export default {
  name: 'date-list',
  data() {
    const { startYear, dateTypeId } = this.$route.params;

    return {
      startYear: Number(startYear),
      dateTypeId,
      addingDate: false,
      savingDates: false,
      loadingDates: true,
      dates: [],
      datesModified: false,
    };
  },
  components: { AddDateDialog },
  methods: {
    async fetchDates() {
      this.loadingDates = true;
      try {
        const datesRes = await fetch(this.datesEndpoint);
        if (!datesRes.ok) throw new Error();
        const { dates = [] } = await datesRes.json() || {};
        this.dates = dates;
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'There was an error loading dates from database.',
        });
        this.dates = [];
      }
      this.loadingDates = false;
    },
    addDate(dateOrDates, comment) {
      this.datesModified = true;
      if (Array.isArray(dateOrDates)) {
        const [start, end] = dateOrDates.map(date => moment(date));
        const days = moment.duration(end.diff(start)).asDays();

        Array(days).fill().forEach(() => {
          this.dates.push({
            date: start.add(1, 'd').format('MMMM D YYYY'),
            comment,
          });
        });
      } else {
        this.dates.push({
          date: moment(dateOrDates).format('MMMM D YYYY'),
          comment,
        });
      }
      this.addingDate = false;
    },
    removeDate(index) {
      this.datesModified = true;
      this.dates.splice(index, 1);
    },
    async saveDates() {
      this.savingDates = true;
      try {
        const token = localStorage.get('jwt');
        const saveRes = await fetch(this.datesEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({ dates: this.dates }),
        });
        if (!saveRes.ok) throw new Error();
        this.$notify({
          title: 'Success',
          message: 'Changes have successfully been saved!',
        });
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'There was an error saving your dates.',
        });
      }
      this.savingDates = false;
      this.datesModified = false;
    },
    async onRouteChange(key) {
      if (this.datesModified) await this.saveDates();
      this[key] = Number(this.$route.params[key]);
      this.fetchDates();
    },
  },
  computed: {
    dateType() {
      return dateTypes[this.dateTypeId];
    },
    datesEndpoint() {
      return `/api/specialDates?type=${this.dateTypeId}&year=${this.startYear}`;
    },
  },
  watch: {
    '$route.params.startYear'() {
      this.onRouteChange('startYear');
    },
    '$route.params.dateTypeId'() {
      this.onRouteChange('dateTypeId');
    },
  },
  created() {
    this.fetchDates();
  },
};
</script>

<style scoped>
.date-list {
  width: 100%;
}

.date-list-header {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.date-list-add {
  margin-left: auto;
}
</style>
