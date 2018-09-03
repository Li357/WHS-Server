<template>
  <div class="date-list">
    <el-container>
      <el-header class="date-list-header" height="75px">
        {{ startYear }} - {{ Number(startYear) + 1 }} {{ dateType }} Dates
        <el-button
          class="date-list-add" type="primary" icon="el-icon-plus"
          @click="addingDate = true" round
        >Add Date</el-button>
        <el-button
          type="danger" icon="el-icon-check"
          @click="saveDates(startYear, dateTypeId)" :disabled="savingDates" round
        >Save Dates</el-button>
        <add-date-dialog :adding-date="addingDate" @add="addDate" @close="addingDate = false">
        </add-date-dialog>
      </el-header>
      <el-table :data="dateStrings" empty-text="No dates" v-loading="savingDates || loadingDates">
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
  props: ['startYear', 'dateTypeId'],
  data: () => ({
    addingDate: false,
    savingDates: false,
    loadingDates: true,
    dates: [],
    datesModified: false,
  }),
  components: { AddDateDialog },
  methods: {
    async fetchDates(...args) {
      this.loadingDates = true;
      try {
        const datesRes = await fetch(this.getDatesEndpoint(...args));
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
        const days = moment.duration(end.diff(start)).asDays() + 1;

        Array(days).fill().forEach((item, index) => {
          this.dates.push({
            date: start.clone().add(index, 'd').toDate(),
            comment,
          });
        });
      } else {
        this.dates.push({
          date: dateOrDates,
          comment,
        });
      }
      this.addingDate = false;
    },
    removeDate(index) {
      this.datesModified = true;
      this.dates.splice(index, 1);
    },
    async saveDates(...args) {
      this.savingDates = true;
      try {
        const token = localStorage.getItem('token');
        const saveRes = await fetch(this.getDatesEndpoint(...args), {
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
    getDatesEndpoint(startYear, dateTypeId) {
      return `/api/specialDates?type=${dateTypeId}&year=${startYear}`;
    },
  },
  computed: {
    dateStrings() {
      return this.dates.map(dateObj => ({
        ...dateObj,
        date: moment(dateObj.date).format('MMMM D, YYYY'),
      }));
    },
    dateType() {
      return dateTypes[this.dateTypeId];
    },
  },
  created() {
    this.fetchDates(this.startYear, this.dateTypeId);
  },
  async beforeRouteUpdate({ params: toParams }, { params: fromParams }, next) {
    if (this.datesModified) this.saveDates(fromParams.startYear, fromParams.dateTypeId);
    this.fetchDates(toParams.startYear, toParams.dateTypeId);
    next();
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
