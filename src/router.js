// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import ExploreView from './views/ExploreView.vue';
import MatchView from './views/MatchView.vue';
import PetView from "./views/PetView.vue";
import ProfilView from "./views/ProfilView.vue";

const routes = [
    {
        path: '/',
        name: 'Explore',
        component: ExploreView,
    },
    {
        path: '/match',
        name: 'Match',
        component: MatchView,
    },
    {
        path: '/pet',
        name: 'Pet',
        component: PetView,
    },
    {
        path: '/profil',
        name: 'Profil',
        component: ProfilView,
    },
    // Tu pourras ajouter ici Matchs, Animaux, etc.
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
