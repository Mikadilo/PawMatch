<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '/src/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const newName = ref(auth.user?.username || '')
const isSavingName = ref(false)
const showDeleteModal = ref(false)
const userStats = ref({ pets: 0, likes: 0, matches: 0 })

async function logout() {
  auth.logout()
  router.push('/login')
}

async function saveName() {
  if (!newName.value.trim() || newName.value === auth.user.username) return
  isSavingName.value = true
  try {
    // Appelle ton API pour changer le nom utilisateur
    const res = await fetch(`http://localhost:3000/users/${auth.user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newName.value.trim() }),
    })
    if (!res.ok) throw new Error('Erreur de mise à jour')
    auth.user.username = newName.value.trim()
    alert('Nom mis à jour avec succès !')
  } catch (e) {
    alert('Erreur lors de la mise à jour du nom.')
    console.error(e)
  } finally {
    isSavingName.value = false
  }
}

async function fetchUserStats() {
  try {
    const res = await fetch(`http://localhost:3000/users/${auth.user.id}/stats`)
    if (!res.ok) throw new Error('Erreur stats')
    const stats = await res.json()
    userStats.value = {
      pets: stats.petsCount,
      likes: stats.likesReceivedCount,
      matches: stats.matchesCount
    }
  } catch (e) {
    console.error('Erreur récupération stats:', e)
  }
}


async function deleteAccount() {
  try {
    // Supprimer compte + données associées via API
    const res = await fetch(`http://localhost:3000/users/${auth.user.id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Erreur suppression')
    alert('Compte supprimé. À bientôt !')
    auth.logout()
    router.push('/login')
  } catch (e) {
    alert('Erreur lors de la suppression du compte.')
    console.error(e)
  }
}

onMounted(() => {
  fetchUserStats()
})
</script>

<template>
  <div class="container py-5" style="max-width: 480px;">
    <div class="card shadow-sm p-4">
      <div class="text-center mb-4">
        <i class="fa-solid fa-paw fa-3x text-primary mb-2"></i>
        <h2>Profil de {{ auth.user.username }}</h2>
        <p class="text-muted">Bienvenue sur PawMatch 🐾</p>
      </div>

      <!-- Changer nom -->
      <div class="mb-3">
        <label for="username" class="form-label fw-bold">Changer votre nom</label>
        <input
            id="username"
            type="text"
            class="form-control"
            v-model="newName"
            :disabled="isSavingName"
            @keyup.enter="saveName"
        />
        <button
            class="btn btn-success mt-2"
            :disabled="isSavingName || !newName.trim() || newName === auth.user.username"
            @click="saveName"
        >
          <i class="fa-solid fa-floppy-disk me-1"></i> Sauvegarder
        </button>
      </div>

      <!-- Stats -->
      <div class="mb-4">
        <h5>Vos statistiques</h5>
        <ul class="list-group list-group-flush">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="fa-solid fa-dog me-2 text-primary"></i>Animaux ajoutés</span>
            <span class="badge bg-primary rounded-pill">{{ userStats.pets }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="fa-solid fa-heart me-2 text-danger"></i>Likes reçus</span>
            <span class="badge bg-danger rounded-pill">{{ userStats.likes }}</span>
          </li>
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span><i class="fa-solid fa-handshake me-2 text-success"></i>Matchs en cours</span>
            <span class="badge bg-success rounded-pill">{{ userStats.matches }}</span>
          </li>
        </ul>
      </div>

      <!-- Boutons -->
      <div class="d-flex justify-content-between">
        <button class="btn btn-outline-secondary" @click="logout">
          <i class="fa-solid fa-right-from-bracket me-1"></i> Déconnexion
        </button>
        <button class="btn btn-danger" @click="showDeleteModal = true">
          <i class="fa-solid fa-user-xmark me-1"></i> Supprimer mon compte
        </button>
      </div>
    </div>

    <!-- Modal confirmation suppression compte -->
    <div v-if="showDeleteModal" class="modal-backdrop" @click.self="showDeleteModal = false">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow">
          <div class="modal-header">
            <h5 class="modal-title text-danger">Confirmer la suppression</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer définitivement votre compte et toutes vos données associées ?</p>
            <p class="text-danger fw-bold">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button class="btn btn-danger" @click="deleteAccount">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}
</style>
