import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null, // récupère si existe
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
    },
    actions: {
        async login(email, password) {
            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) throw new Error('Login failed');
            const user = await res.json();
            this.user = user;
            localStorage.setItem('user', JSON.stringify(user)); // Sauvegarde dans localStorage
            return user;
        },
        logout() {
            this.user = null;
            localStorage.removeItem('user'); // Supprime le stockage
        },
    },
});
