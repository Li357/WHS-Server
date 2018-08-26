import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import NotFound from '@/views/NotFound.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: Dashboard,
    meta: { admin: true },
  },
  { path: '/login', component: Login },
  { path: '*', component: NotFound },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
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
