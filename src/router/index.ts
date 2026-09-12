import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/single-qubit',
      name: 'single-qubit',
      component: () => import('../views/SingleQubit.vue'),
    },
    {
      path: '/multi-qubit-1',
      name: 'multi-qubit-1',
      component: () => import('../views/MultiQubitView1.vue'),
    },
    {
      path: '/multi-qubit-2',
      name: 'multi-qubit-2',
      component: () => import('../views/MultiQubitView2.vue'),
    },
  ],
})

export default router
