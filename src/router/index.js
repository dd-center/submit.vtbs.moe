import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Submit from '../views/Submit.vue'
import Edit from '../views/Edit.vue'
import Workspace from '../views/Workspace.vue'
import Login from '../views/Login.vue'
import Issue from '../views/Issue.vue'

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
}, {
  path: '/issue',
  component: Issue
}, {
  path: '/login',
  component: Login,
  props: route => ({ code: route.query.code })
}]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
