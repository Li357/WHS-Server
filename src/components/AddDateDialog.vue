<template>
  <div class="add-date-dialog">
    <el-dialog
      :visible="addingDate"
      @close="$emit('close')"
      width="30%"
    >
      <div slot="title" class="add-date-header">
        Add Date
        <span class="add-date-header-desc">Pick a single date or range to add</span>
      </div>
      <el-row>
        <el-date-picker
          v-model="newDateOrDates"
          type="date"
          placeholder="Pick new date"
        ></el-date-picker>
        OR
        <el-date-picker
          v-model="newDateOrDates"
          type="daterange"
          range-separator="To"
          start-placeholder="Pick start date"
          end-placeholder="Pick end date"
        ></el-date-picker>
      </el-row>
      <el-row>
        <el-input v-model="comment" placeholder="Add comment"></el-input>
        <el-button
          type="primary" class="date-list-add-submit"
          @click="handleClick" :disabled="newDateOrDates === null"
        >Add Date</el-button>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'add-date-dialog',
  props: ['adding-date', 'add'],
  data: () => ({
    newDateOrDates: null,
    comment: '',
  }),
  methods: {
    handleClick() {
      this.$emit('add', this.newDateOrDates, this.comment);
      this.newDateOrDates = null;
      this.comment = '';
    },
  },
};
</script>

<style scoped>
.date-list-add-submit {
  float: right;
}

.add-date-dialog .el-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.add-date-dialog .el-row * {
  margin: 10px;
}

.add-date-header {
  display: flex;
  flex-direction: column;
}

.add-date-header-desc {
  font-weight: normal;
  font-size: 17px;
}
</style>
