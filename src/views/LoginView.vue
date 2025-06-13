<template>
  <div
      class="d-flex justify-content-center align-items-center vh-100 vw-100"
      style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);"
  >
    <div
        class="card p-4 shadow-lg rounded-4"
        style="width: 360px; background-color: #ffffffcc;"
    >
      <!-- Logo -->
      <img
          src="/assets/logolight.jpg"
          alt="Logo PawMatch"
          class="mx-auto d-block mb-3"
          style="max-width: 120px; height: auto; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));"
      />

      <!-- Title -->
      <h1 class="text-center fw-bold mb-1" style="color: #5c4d7d;">PawMatch</h1>
      <h4
          class="text-center text-muted fw-light mb-4"
      >
        {{ isRegister ? 'Inscription' : 'Connexion' }}
      </h4>

      <div class="mb-3">
        <label for="email" class="form-label">Adresse mail</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="fa-solid fa-envelope"></i>
          </span>
          <input
              type="email"
              id="email"
              class="form-control"
              placeholder="exemple@domaine.com"
              v-model="email"
          />
        </div>
      </div>

      <div class="mb-4">
        <label for="password" class="form-label">Mot de passe</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="fa-solid fa-lock"></i>
          </span>
          <input
              type="password"
              id="password"
              class="form-control"
              placeholder="Votre mot de passe"
              v-model="password"
          />
        </div>
      </div>

      <!-- Champ username uniquement en mode inscription -->
      <div v-if="isRegister" class="mb-4">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="fa-solid fa-user"></i>
          </span>
          <input
              type="text"
              id="username"
              class="form-control"
              placeholder="Votre nom d'utilisateur"
              v-model="username"
          />
        </div>
      </div>

      <button
          class="btn btn-primary w-100 mb-3"
          @click="isRegister ? register() : login()"
      >
        <i
            :class="isRegister ? 'fa-solid fa-user-plus' : 'fa-solid fa-right-to-bracket'"
            class="me-2"
        ></i>
        {{ isRegister ? 'S\'inscrire' : 'Se connecter' }}
      </button>

      <button
          class="btn btn-link w-100"
          @click="isRegister = !isRegister"
      >
        {{ isRegister ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? S\'inscrire' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

const isRegister = ref(false)
const email = ref('')
const password = ref('')
const username = ref('')

async function login() {
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    alert('Erreur de connexion : ' + error.message)
  }
}

async function register() {
  if (!username.value || !email.value || !password.value) {
    alert('Merci de remplir tous les champs')
    return
  }

  try {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Erreur lors de l\'inscription')
    }

    alert('Inscription réussie, vous pouvez maintenant vous connecter')
    isRegister.value = false
    // Optionnel : reset champs
    username.value = ''
    email.value = ''
    password.value = ''
  } catch (error) {
    alert('Erreur : ' + error.message)
  }
}
</script>
