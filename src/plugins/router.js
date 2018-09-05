import Vue from 'vue';
import VueRouter from 'vue-router';

import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import NotFound from '@/views/NotFound.vue';
import DateList from '@/components/DateList.vue';
import store from '@/plugins/store';

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

  // May convert to SSR in future
  if (to.matched.some(({ meta }) => meta.admin)) {
    const token = localStorage.getItem('token');
    if (!token) {
      next('/login');
      return;
    }

    try {
      const verificationRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!verificationRes.ok) {
        next('/login');
        return;
      }
      const { user } = await verificationRes.json();
      if (user.admin) next();
      else next('/login');
    } catch (error) {
      next('/login');
    }
  } else next();
  store.commit('finish');
});

export default router;
