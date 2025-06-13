<template>
  <div class="container py-4">
    <!-- Bouton Mes Likes -->
    <button
        class="btn btn-danger w-100 mb-4 d-flex align-items-center justify-content-center gap-2"
        @click="showLikes = !showLikes"
        aria-pressed="showLikes"
    >
      <i :class="['fa-heart', showLikes ? 'fas' : 'far', 'fa-lg', 'heart-icon']"></i>
      {{ showLikes ? 'Cacher mes Likes' : 'Mes Likes' }}
    </button>

    <!-- Section Mes Likes -->
    <transition name="fade">
      <div v-if="showLikes" class="mb-5">
        <div v-if="likedPets.length" class="row g-4">
          <div
              v-for="pet in likedPets"
              :key="pet.id"
              class="col-6 col-md-4 col-lg-3"
              @click="selectPetToRemove(pet)"
              role="button"
              tabindex="0"
              @keyup.enter="selectPetToRemove(pet)"
          >
            <div class="card h-100 shadow-sm pet-card liked-card">
              <img
                  :src="pet.photo || defaultImage"
                  class="card-img-top rounded-top"
                  alt="Photo d'animal"
                  style="height: 160px; object-fit: cover;"
              />
              <div class="card-body text-center">
                <h6 class="card-title mb-1">{{ pet.name }}</h6>
                <small class="text-muted">Cliquez pour retirer le like</small>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-center text-muted fs-5 mt-4">Aucun animal liké pour le moment.</p>
      </div>
    </transition>

    <!-- Section Matchs en cours -->
    <h4 class="mb-3 text-primary fw-bold">Matchs en cours <i class="fas fa-paw"></i></h4>
    <div v-if="matches.length" class="row g-4">
      <div
          v-for="match in matches"
          :key="match.id"
          class="col-6 col-md-4 col-lg-3"
          role="group"
          aria-label="Match animal"
      >
        <div class="card h-100 shadow-sm pet-card match-card">
          <img
              :src="match.photo || defaultImage"
              class="card-img-top rounded-top"
              alt="Photo d'animal match"
              style="height: 160px; object-fit: cover;"
          />
          <div class="card-body text-center">
            <h6 class="card-title mb-1">{{ match.name }}</h6>
            <p class="text-muted small mb-2">{{ match.type }}, {{ match.age }} ans</p>
            <button
                class="btn btn-success btn-sm px-4"
                @click="openChat(match)"
                aria-label="Ouvrir le chat avec {{ match.name }}"
            >
              <i class="fas fa-comments me-2"></i>Chat
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-center text-muted fs-5 mt-4">Aucun match pour le moment.</p>

    <!-- Modal Suppression Like -->
    <transition name="fade">
      <div
          v-if="petToRemove"
          class="modal-backdrop"
          @click.self="closeModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
      >
        <div class="modal-dialog modal-dialog-centered shadow-lg">
          <div class="modal-content rounded-4">
            <div class="modal-header border-bottom-0">
              <h5 class="modal-title fw-bold" id="modalTitle">Supprimer ce like ?</h5>
              <button type="button" class="btn-close" @click="closeModal" aria-label="Fermer"></button>
            </div>
            <div class="modal-body text-center">
              <img
                  :src="petToRemove.photo || defaultImage"
                  class="img-fluid rounded mb-3 shadow-sm"
                  style="max-height: 220px; object-fit: cover;"
                  alt="Photo de l'animal"
              />
              <p class="fs-5">
                Voulez-vous retirer votre like sur <strong>{{ petToRemove.name }}</strong> ?
              </p>
            </div>
            <div class="modal-footer border-top-0 justify-content-center gap-3">
              <button class="btn btn-outline-secondary px-4" @click="closeModal">
                <i class="fas fa-times me-2"></i>Annuler
              </button>
              <button class="btn btn-danger px-4" @click="removeLike">
                <i class="fas fa-heart-broken me-2"></i>Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Chat -->
    <transition name="fade">
      <div
          v-if="chatOpen"
          class="modal-backdrop"
          @click.self="closeChat"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatModalTitle"
      >
        <div
            class="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered shadow-lg"
            style="max-width: 600px;"
        >
          <div class="modal-content d-flex flex-column rounded-4" style="height: 80vh;">
            <div class="modal-header bg-primary text-white rounded-top">
              <h5 class="modal-title fw-bold" id="chatModalTitle">
                <i class="fas fa-comments me-2"></i>Chat avec {{ chatPartnerName }}
              </h5>
              <button type="button" class="btn-close btn-close-white" @click="closeChat" aria-label="Fermer"></button>
            </div>
            <div
                class="modal-body flex-grow-1 overflow-auto px-3 py-3"
                ref="messagesContainer"
                style="background: #fefefe; scroll-behavior: smooth;"
                tabindex="0"
            >
              <div
                  v-for="(msg, idx) in messages"
                  :key="idx"
                  class="mb-3 d-flex"
                  :class="msg.authorId === auth.user.id ? 'justify-content-end' : 'justify-content-start'"
              >
                <div
                    class="chat-bubble px-3 py-2 rounded shadow-sm"
                    :class="msg.authorId === auth.user.id ? 'bubble-me' : 'bubble-other'"
                >
                  <small
                      class="d-block mb-1 text-muted"
                      style="font-size: 0.75em; font-style: italic;"
                  >
                    {{ getUsername(msg.authorId) }} • {{ new Date(msg.date).toLocaleTimeString() }}
                  </small>
                  <span style="white-space: pre-wrap;">{{ msg.text }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer gap-2 py-3 px-3">
              <input
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  class="form-control"
                  placeholder="Écrire un message..."
                  autocomplete="off"
                  aria-label="Message à envoyer"
              />
              <button
                  class="btn btn-primary"
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  aria-disabled="!newMessage.trim()"
                  aria-label="Envoyer le message"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Animation fade pour transitions modales et likes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bouton coeur animé */
.heart-icon {
  transition: color 0.3s ease;
}
.btn-danger .heart-icon.fas {
  color: #ff4757;
  animation: heartbeat 1.2s infinite;
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

/* Carte animaux liked et match */
.pet-card {
  border-radius: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 25px rgb(0 0 0 / 0.15);
}
.liked-card {
  border: 2px solid #ff6b81;
}
.match-card {
  border: 2px solid #1dd1a1;
}

/* Modal backdrop avec flou léger */
.modal-backdrop {
  backdrop-filter: blur(5px);
}

/* Chat bubble */
.chat-bubble {
  max-width: 75%;
  word-wrap: break-word;
  white-space: pre-wrap;
  font-size: 0.9rem;
}
.bubble-me {
  background-color: #0d6efd;
  color: white;
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 1.25rem;
  border-top-left-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
  box-shadow: 0 3px 8px rgb(13 110 253 / 0.3);
}
.bubble-other {
  background-color: #e9ecef;
  color: #212529;
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 1.25rem;
  border-top-right-radius: 1.25rem;
  border-top-left-radius: 1.25rem;
  box-shadow: 0 3px 8px rgb(0 0 0 / 0.1);
}

/* Input chat */
.modal-footer input.form-control {
  flex-grow: 1;
  border-radius: 50px;
  border: 1px solid #ced4da;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  font-size: 1rem;
}
.modal-footer button.btn-primary {
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scroll messages */
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-thumb {
  background-color: #ced4da;
  border-radius: 4px;
}
.modal-body::-webkit-scrollbar-track {
  background-color: #f8f9fa;
}

/* Accessibility focus outline */
.pet-card:focus,
.pet-card:hover {
  outline: none;
  box-shadow: 0 0 0 3px #339af0;
}

/* Responsive fix for smaller modals on mobiles */
@media (max-width: 576px) {
  .modal-dialog {
    max-width: 90vw !important;
  }
}
</style>


<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const likedPets = ref([])
const matches = ref([])
const showLikes = ref(false)
const defaultImage = 'https://placekitten.com/400/300'

const petToRemove = ref(null)

// Chat related
const chatOpen = ref(false)
const chatPartnerName = ref('')
const messages = ref([])
const newMessage = ref('')
const currentConversationId = ref(null)
const users = ref([])
const messagesContainer = ref(null)

function selectPetToRemove(pet) {
  petToRemove.value = pet
}
function closeModal() {
  petToRemove.value = null
}
async function removeLike() {
  if (!petToRemove.value) return
  try {
    await fetch(`http://localhost:3000/like/${petToRemove.value.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: auth.user.id })
    })
    likedPets.value = likedPets.value.filter(p => p.id !== petToRemove.value.id)
    petToRemove.value = null
  } catch (err) {
    console.error('Erreur lors de la suppression du like', err)
  }
}
async function fetchLikesAndMatches() {
  if (!auth.user) return
  const resLikes = await fetch(`http://localhost:3000/likes/${auth.user.id}`)
  likedPets.value = await resLikes.json()
  const resMatches = await fetch(`http://localhost:3000/matches/${auth.user.id}`)
  matches.value = await resMatches.json()
}

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/users')
  users.value = await res.json()
}
function getUsername(userId) {
  const user = users.value.find(u => u.id === userId)
  return user ? user.username : 'Inconnu'
}

// Ouvre chat avec le propriétaire du match
async function openChat(pet) {
  const partnerId = pet.ownerId
  if (partnerId === auth.user.id) {
    alert("Tu ne peux pas chatter avec toi-même !")
    return
  }
  chatPartnerName.value = getUsername(partnerId)
  chatOpen.value = true
  newMessage.value = ''

  // Crée ou récupère conversation entre utilisateurs
  const res = await fetch('http://localhost:3000/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId1: auth.user.id, userId2: partnerId })
  })
  const conv = await res.json()
  currentConversationId.value = conv.id

  await loadMessages()
  startPolling()
}

async function loadMessages() {
  if (!currentConversationId.value) return
  const res = await fetch(`http://localhost:3000/conversations/${currentConversationId.value}/messages`)
  messages.value = await res.json()
  scrollToBottom()
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentConversationId.value) return
  const text = newMessage.value.trim()
  newMessage.value = ''

  await fetch(`http://localhost:3000/conversations/${currentConversationId.value}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      authorId: auth.user.id,
      text
    })
  })
  await loadMessages()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

let pollingInterval = null
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval)
  pollingInterval = setInterval(loadMessages, 5000)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function closeChat() {
  chatOpen.value = false
  currentConversationId.value = null
  messages.value = []
  stopPolling()
}

onMounted(() => {
  fetchLikesAndMatches()
  fetchUsers()
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
