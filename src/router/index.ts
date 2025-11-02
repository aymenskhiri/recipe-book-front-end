import { createRouter, createWebHistory } from 'vue-router'

 
import HomeView from '@/views/User/HomeView.vue'
import LoginView from '@/views/Auth/LoginView.vue'
import RegisterView from '@/views/Auth/RegisterView.vue'
import ForgotPasswordView from '@/views/Auth/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/Auth/ResetPasswordView.vue'
import MyRecipesView from '@/views/User/MyRecipesView.vue'
import RecipeDetailView from '@/views/User/RecipeDetailView.vue'
import CreateRecipeView from '@/views/User/CreateRecipeView.vue'
import AdminView from '@/views/Admin/AdminView.vue'
 

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/forgot-password', name: 'forgot', component: ForgotPasswordView },
  { path: '/reset-password', name: 'reset', component: ResetPasswordView },

  {
    path: '/my-recipes',
    name: 'my-recipes',
    component: MyRecipesView,
    meta: { requiresAuth: true },
  },
  {
    path: '/recipe/:id',
    name: 'recipe-detail',
    component: RecipeDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-recipe',
    name: 'create-recipe',
    component: CreateRecipeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true },  
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
 
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const publicPages = ['login', 'register', 'forgot', 'reset']
 
  const routeName = to.name as string
  const needsAuth = to.meta.requiresAuth
  const needsAdmin = to.meta.requiresAdmin
  const isPublicPage = publicPages.includes(routeName)
  const isPublicAndLoggedIn = isPublicPage && token
 
  let user = null
  try {
    const userData = localStorage.getItem('user')
    user = userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Error parsing user data:', error)
    user = null
  }
 
  const isAdmin = user?.role === 'admin' || user?.is_admin === true
 
  if (needsAuth && !token) {
    return next('/login')
  }
 
  if (needsAdmin && !isAdmin) {
    return next('/')
  }
 
  if (isPublicAndLoggedIn) {
    return next('/')
  }

  next()
})

export default router
