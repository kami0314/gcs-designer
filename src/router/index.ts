import { createRouter, createWebHashHistory } from 'vue-router'
import Preview from '../views/Preview.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'preview',
      component: Preview
    },
    {
      path: '/edit',
      name: 'Edit',
      component: () => import('../views/Edit.vue')
    }
  ]
})

export default router
