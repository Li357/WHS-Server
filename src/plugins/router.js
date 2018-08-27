import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import NotFound from '@/views/NotFound.vue';
import DateList from '@/components/DateList.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/dashboard/:startYear',
    component: Dashboard,
    meta: { admin: true },
    children: [{
      path: ':dateTypeId',
      component: DateList,
    }],
  },
  { path: '/login', component: Login },
  { path: '*', component: NotFound },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.fullPath === '/') {
    const currentYear = new Date().getFullYear();
    next(`/dashboard/${currentYear}/1`);
  }

  if (to.matched.some(({ meta }) => meta.admin)) {
    if (localStorage.getItem('jwt')) {
      next();
    } else {
      next('/login');
    }
    return;
  }
  next();
});

export default router;
