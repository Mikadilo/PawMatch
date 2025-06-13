import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

import ExploreView from './views/ExploreView.vue'
import MatchView from './views/MatchView.vue'
import PetView from './views/PetView.vue'
import ProfilView from './views/ProfilView.vue'
import LoginView from './views/LoginView.vue'

const routes = [
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/', name: 'Explore', component: ExploreView, meta: { requiresAuth: true } },
    { path: '/match', name: 'Match', component: MatchView, meta: { requiresAuth: true } },
    { path: '/pet', name: 'Pet', component: PetView, meta: { requiresAuth: true } },
    { path: '/profil', name: 'Profil', component: ProfilView, meta: { requiresAuth: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// ✅ Protéger les routes
router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next('/login')
    } else {
        next()
    }
})

export default router
