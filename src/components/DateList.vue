<template>
  <div class="date-list">
    <el-container>
      <el-header class="date-list-header" height="75px">
        {{ year }} - {{ year + 1 }} {{ type }} Dates
        <el-button
          class="date-list-add" type="primary" icon="el-icon-plus"
          @click="addingDate = true" round
        >
          Add Date
        </el-button>
        <el-dialog
          title="Add Date"
          :visible.sync="addingDate"
          width="30%"
        >
          <el-row>
            <el-date-picker
              v-model="newDate"
              type="date"
              placeholder="Pick new date"
            ></el-date-picker>
            <el-button
              type="primary" class="date-list-add-submit"
              @click="addDate" :disabled="newDate === null"
            >
              Add Date
            </el-button>
          </el-row>
        </el-dialog>
      </el-header>
      <el-table :data="stringDates" empty-text="No dates">
        <el-table-column prop="date" label="Date"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <el-button
              type="danger" size="mini" icon="el-icon-delete"
              @click="removeDate(scope.$index)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-container>
  </div>
</template>

<script>
import moment from 'moment';

const getDateSuffix = year => String(year).slice(2); 
const dateToLookupString = year => `${getDateSuffix(year)}-${getDateSuffix(year + 1)}`;

export default {
  name: 'date-list',
  props: ['year', 'type', 'dates'],
  data: () => ({
    addingDate: false,
    newDate: null,
  }),
  methods: {
    addDate() {
      this.dates.push({ date: this.newDate });
      this.newDate = null;
      this.addingDate = false;
    },
    removeDate(index) {
      this.dates.splice(index, 1);
    },
  },
  computed: {
    /* filteredDates() {
      return this.dates
    },
    stringDates() {
      return this.dates.map(({ date }) => ({
        date: moment(date).format('MMMM D, YYYY'),
      }));
    }, */
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

.date-list-add-submit {
  float: right;
}
</style>
