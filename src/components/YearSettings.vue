<template>
  <el-container>
    <el-header class="settings-header">
      {{ year }} Settings
      <el-button
        icon="el-icon-edit" type="text"
        @click="editingSettings = true"
      >Edit</el-button>
    </el-header>
    <el-main>
      <el-row>Semester One Start: <span>{{ formattedSettings[0] }}</span></el-row>
      <el-row>Semester One End: <span> {{ formattedSettings[1] }}</span></el-row>
      <el-row>Semester Two Start: <span>{{ formattedSettings[2] }}</span></el-row>
      <el-row>Last Day: <span>{{ formattedSettings[3] }}</span></el-row>
    </el-main>
    <el-dialog
      :visible.sync="editingSettings"
      width="30%"
      class="settings-dialog"
      :before-close="handleClose"
    >
      <div slot="title" class="settings-dialog-header">Edit {{ year }} Settings</div>
      <el-row>
        Semester One Start:
        <el-date-picker
          v-model="settings.semesterOneStart"
          type="date"
          placeholder="Pick semester one start"
        ></el-date-picker>
      </el-row>
      <el-row>
        Semester One End:
        <el-date-picker
          v-model="settings.semesterOneEnd"
          type="date"
          placeholder="Pick semester one end"
        ></el-date-picker>
      </el-row>
      <el-row>
        Semester Two Start:
        <el-date-picker
          v-model="settings.semesterTwoStart"
          type="date"
          placeholder="Pick semester two start"
        ></el-date-picker>
      </el-row>
      <el-row>
        Last Day:
        <el-date-picker
          v-model="settings.lastDay"
          type="date"
          placeholder="Pick last day"
        ></el-date-picker>
      </el-row>
      <el-row>
        <el-button
          type="primary" class="settings-submit"
          :disabled="Object.values(settings).some(date => date === null)"
          @click="handleSubmit"
        >Add Date</el-button>
      </el-row>
    </el-dialog>
  </el-container>
</template>

<script>
import moment from 'moment';

const initialSettings = {
  semesterOneStart: null,
  semesterOneEnd: null,
  semesterTwoStart: null,
  lastDay: null,
};

export default {
  name: 'year-settings',
  props: ['year'],
  data: () => ({
    editingSettings: false,
    settings: initialSettings,
  }),
  methods: {
    async fetchSettings() {
      try {
        const settingsRes = await fetch(this.settingsEndpoint);
        if (!settingsRes.ok) throw new Error();
        const doc = await settingsRes.json();

        if (!doc) {
          this.$notify({
            title: 'Note',
            message: `Please fill out the settings section for ${this.year}.`,
          });
        }

        this.settings = doc ? doc.settings : initialSettings;
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'There was an error fetching settings.',
        });
      }
    },
    async saveSettings() {
      try {
        const token = localStorage.getItem('token');
        const saveRes = await fetch(this.settingsEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({ settings: this.settings }),
        });
        if (!saveRes.ok) throw new Error();
        this.$notify({
          title: 'Success',
          message: 'Your settings were successfully saved!',
        });
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'There was an error saving your settings',
        });
      }
    },
    handleClose(done) {
      if (Object.values(this.settings).every(date => date !== null)) {
        done();
        return;
      }
      this.$notify({
        title: 'Error',
        message: 'Please complete all the setting fields.',
      });
    },
    handleSubmit() {
      this.saveSettings();
      this.editingSettings = false;
    },
  },
  computed: {
    formattedSettings() {
      return Object.values(this.settings).map((date) => {
        const wrapped = moment(date);
        // eslint-disable-next-line no-underscore-dangle
        return wrapped._isValid ? wrapped.format('MMMM D, YYYY') : '-';
      });
    },
    settingsEndpoint() {
      return `/api/specialDates?type=5&year=${this.year}`;
    },
  },
  watch: {
    year() {
      this.fetchSettings();
    },
  },
  created() {
    this.fetchSettings();
  },
};
</script>

<style scoped>
.settings-header {
  display: flex;
  align-items: center;
  font-size: 25px;
  font-weight: bold;
}

.settings-header button {
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

.settings-dialog .el-row .el-date-editor {
  float: right;
}

.settings-dialog .el-row * {
  margin: 3px;
}

.settings-dialog-header {
  font-size: 20px;
  font-weight: bold;
}

.settings-submit {
  float: right;
}
</style>
