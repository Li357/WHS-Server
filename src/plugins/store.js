import Vue from 'vue';
import Vuex, { Store } from 'vuex';

Vue.use(Vuex);

const store = new Store({
  state: {
    loading: true,
  },
  mutations: {
    finish(state) {
      state.loading = false;
    },
  },
});
export default store;
