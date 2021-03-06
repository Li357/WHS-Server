<template>
  <div class="date-list">
    <el-container>
      <el-header class="date-list-header" height="75px">
        {{ startYear }} - {{ Number(startYear) + 1 }} {{ dateTypeNames[dateType] }}
        <div>
          <el-button
            type="primary" icon="el-icon-plus"
            @click="addingDates = true" :disabled="loading" round
          >Add Date</el-button>
          <el-button
            type="danger" icon="el-icon-check"
            @click="saveDates(startYear, dateType)" :disabled="loading" round
          >Save Dates</el-button>
          <el-button
            class="mobile" type="primary" icon="el-icon-plus"
            @click="addingDates = true" :disabled="loading" round
          ></el-button>
          <el-button
            class="mobile" type="danger" icon="el-icon-check"
            @click="saveDates(startYear, dateType)" :disabled="loading" round
          ></el-button>
        </div>
      </el-header>
      <el-table :data="datesDisplay" empty-text="No dates" v-loading="loading">
        <el-table-column prop="date" label="Date"></el-table-column>
        <el-table-column prop="comment" label="Comment"></el-table-column>
        <el-table-column align="right">
          <template slot-scope="scope">
            <span v-if="!scope.row.saved" class="date-list-unsaved">Unsaved</span>
            <el-button
              type="danger" size="mini" icon="el-icon-delete"
              @click="removeDate(scope.row.type, scope.row.year, scope.row.date)"
            >Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-container>
    <add-date-modal
      :adding-dates="addingDates" :start-year="startYear" :date-type="dateType"
      @add="addDates" @close="addingDates = false"
    ></add-date-modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import { format } from 'date-fns';

import AddDateModal from './AddDateModal.vue';
import { DateListType, DateSchemaWithoutID, DateSchema } from '../../shared/types/api';
import { ClientDate } from '../types/DateList';
import { dateTypeNames } from '../utils';
import API from '../api-wrapper';

@Component({
  name: 'date-list',
  components: { AddDateModal },
})
export default class DateList extends Vue {
  @Prop(String) private readonly startYear!: string;
  @Prop(String) private readonly dateType!: DateListType;
  private addingDates = false;
  private savingDates = false;
  private loadingDates = true;
  private dates: ClientDate[] = [];

  private dateTypeNames = dateTypeNames;
  private existingDates: { [key: string]: boolean } = {};

  get loading() {
    return this.addingDates || this.savingDates || this.loadingDates;
  }

  public beforeRouteEnter(to: Route, from: Route, next: (cb: (vm: DateList) => void) => void) {
    next((vm: DateList) => {
      vm.fetchDates(vm.startYear, vm.dateType);
    });
  }

  public async beforeRouteUpdate({ params: toParams }: Route, from: Route, next: () => void) {
    await this.saveDates(this.startYear, this.dateType);
    next();
    this.fetchDates(toParams.startYear, toParams.dateType as DateListType);
  }

  public async beforeRouteLeave(to: Route, from: Route, next: () => void) {
    await this.saveDates(this.startYear, this.dateType);
    next();
  }

  get datesDisplay() {
    return this.dates.map(({ date, ...rest }) => ({
      ...rest,
      date: format(date, 'MMMM D, YYYY'),
    }));
  }

  private async fetchDates(startYear: string, dateType: DateListType) {
    this.loadingDates = true;
    try {
      const dates = await API.getDates(startYear, dateType);
      this.dates = dates.map((date) => ({ ...date, saved: true }));
      this.existingDates = this.dates.reduce((obj: { [key: string]: boolean }, { date }) => {
        obj[date] = true;
        return obj;
      }, {});
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.loadingDates = false;
  }

  private addDates(dates: DateSchemaWithoutID[]) {
    const { filtered, duplicate } = dates.reduce((
      obj: {
        duplicate: DateSchemaWithoutID[],
        filtered: DateSchemaWithoutID[],
      },
      dateObj,
    ) => {
      if (this.existingDates[dateObj.date]) {
        obj.duplicate.push(dateObj);
      } else {
        this.existingDates[dateObj.date] = true;
        obj.filtered.push(dateObj);
      }
      return obj;
    }, { filtered: [], duplicate: [] });
    if (duplicate.length > 0) {
      const datesString = duplicate.map(({ date }) => format(date, 'MMMM D, YYYY')).join(', ');
      this.$notify({
        title: 'Info',
        message: `Duplicate date(s): ${datesString} were not added.`,
      });
    }

    API.addDates(filtered);
    this.dates.push(...filtered.map((date) => ({ ...date, saved: false })));
    this.$notify({
      title: 'Success',
      message: 'Date(s) added! Please click Save Dates to commit changes.',
    });
  }

  private async saveDates(startYear: string, dateType: DateListType) {
    this.savingDates = true;
    try {
      const hasChanges = await API.commitDateChanges();
      if (hasChanges) {
        this.dates = this.dates.map((date) => ({ ...date, saved: true }));
        this.$notify({
          title: 'Success',
          message: `${startYear} - ${Number(startYear) + 1} ${this.dateTypeNames[dateType]} saved!`,
        });
      } else {
        this.$notify({
          title: 'Info',
          message: 'No dates to save.',
        });
      }
    } catch ({ message }) {
      this.$notify({
        title: 'Error',
        message,
      });
    }
    this.savingDates = false;
  }

  private removeDate(type: DateListType, year: string, date: string) {
    const isoString = new Date(date).toISOString();
    API.removeDate(type, year, isoString);
    this.dates = this.dates.filter((dateObj) => (
      !(dateObj.type === type && dateObj.year === year && dateObj.date === isoString)
    ));
    this.$notify({
      title: 'Success',
      message: 'Date removed! Please click Save Dates to commit changes.',
    });
  }
}
</script>

<style lang="stylus" scoped>
.date-list
  width 80%

  @media screen and (max-width: 900px)
    width 100%

  &-header
    display flex
    align-items center
    justify-content space-between

    @media screen and (max-width: 575px)
      flex-direction column
      margin 10px

    & .mobile
      display none

    @media screen and (max-width: 340px)
      & > div
        display flex
        flex-direction row

        & > *
          display none

      & .mobile
        display block

  &-unsaved
    font-weight bold
    color: red
    margin 0 10px
</style>
