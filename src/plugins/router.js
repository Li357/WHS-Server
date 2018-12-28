import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import NotFound from '@/views/NotFound.vue';
import DateList from '@/components/DateList.vue';
import store from '@/plugins/store';
import { getCookie } from '@/utils';

Vue.use(VueRouter);

const routes = [
  {
    path: '/dashboard/:startYear',
    component: Dashboard,
    meta: { admin: true },
    children: [{
      path: ':dateTypeId',
      component: DateList,
      props: true,
    }],
    props: true,
  },
  { path: '/login', component: Login },
  { path: '*', component: NotFound },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.fullPath === '/') {
    const currentYear = new Date().getFullYear();
    next(`/dashboard/${currentYear}/1`);
    return;
  }

  if (to.matched.some(({ meta }) => meta.admin)) {
    const payload = getCookie('payload');
    if (!payload) {
      next('/login');
      return;
    }

    const [, decoded] = payload.split('.');
    const json = JSON.parse(atob(decoded));
    // Ok because all date modifications require httpOnly cookies anyway
    if (json.admin) next();
    else next('/login');
  } else next();
  store.commit('finish');
});

export default router;
