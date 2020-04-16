import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Submit from '../views/Submit.vue'
import Edit from '../views/Edit.vue'
import Workspace from '../views/Workspace.vue'

Vue.use(VueRouter)

const routes = [{
  path: '/',
  component: Home
}, {
  path: '/submit',
  component: Submit
}, {
  path: '/edit',
  component: Edit
}, {
  path: '/edit/:file',
  component: Edit,
  props: true
}, {
  path: '/workspace',
  component: Workspace
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
