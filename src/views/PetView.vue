<template>
  <div>

  <div
      class="container p-4 shadow"
      style="min-height: calc(100vh - 60px); background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white;"
  >
    <div class="d-flex justify-content-between align-items-center mb-4" style="border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 0.75rem;">
      <h2>Mes animaux</h2>
      <button
          class="btn btn-light btn-lg shadow-sm text-primary fw-bold"
          @click="showModal = true"
          aria-label="Ajouter un animal"
          style="border-radius: 50px; letter-spacing: 0.05em;"
      >
        <i class="fa-solid fa-plus me-2"></i> Ajouter
      </button>
    </div>

    <div v-if="pets.length === 0" class="text-center fst-italic mt-5 opacity-75">
      Vous n'avez pas encore d'animaux.
    </div>

    <div class="d-flex flex-wrap gap-4 mt-2 animaux-container">
      <div
          v-for="pet in pets"
          :key="pet.id"
          class="pet-card"
          @click="openPetProfile(pet)"
          style="cursor: pointer;"
      >



        <div
            class="card h-100 shadow"
            style="transition: transform 0.3s ease, box-shadow 0.3s ease; border-radius: 20px;"
            @mouseover="($event.currentTarget.style.transform = 'translateY(-8px)'); ($event.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)')"
            @mouseleave="($event.currentTarget.style.transform = 'none'); ($event.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)')"
        >
          <img
              v-if="pet.photo"
              :src="pet.photo"
              class="card-img-top rounded-top-4"
              alt="Photo de l'animal"
              style="height: 220px; object-fit: cover; border-top-left-radius: 20px; border-top-right-radius: 20px;"
          />
          <div class="card-body text-center" style="background: rgba(255, 255, 255, 0.9); border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
            <h5 class="card-title fw-semibold text-primary mb-1 text-truncate">{{ pet.name }}</h5>
            <p class="card-text text-muted fs-6">{{ pet.type }}, {{ pet.age }} ans</p>
          </div>
        </div>
      </div>
    </div>


    <!-- Modal profil animal -->
    <div
        class="modal fade"
        tabindex="-1"
        :class="{ show: showProfileModal }"
        style="display: block;"
        v-if="showProfileModal"
        aria-modal="true"
        role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 shadow-lg">
          <div class="modal-header border-0">
            <h5 class="modal-title text-primary fw-bold">{{ selectedPet.name }}</h5>
            <button type="button" class="btn-close" @click="closeProfileModal" aria-label="Fermer"></button>
          </div>
          <div class="modal-body text-center">
            <img
                v-if="selectedPet.photo"
                :src="selectedPet.photo"
                alt="Photo de l'animal"
                class="rounded-circle mb-4 shadow-sm"
                style="width: 180px; height: 180px; object-fit: cover;"
            />
            <p class="fs-5 mb-2"><strong>Type :</strong> {{ selectedPet.type }}</p>
            <p class="fs-5 mb-3"><strong>Âge :</strong> {{ selectedPet.age }} ans</p>
            <!-- Plus d’infos ici -->
          </div>
          <div class="modal-footer border-0 justify-content-between">
            <button class="btn btn-outline-danger fw-semibold" @click="deletePet(selectedPet.id)">
              <i class="fa-solid fa-trash me-2"></i> Supprimer
            </button>
            <button class="btn btn-secondary fw-semibold" @click="closeProfileModal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal ajout -->
  <div
      class="modal fade"
      tabindex="-1"
      :class="{ show: showModal }"
      style="display: block;"
      v-if="showModal"
      aria-modal="true"
      role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow-lg">
        <div class="modal-header border-0">
          <h5 class="modal-title text-primary fw-bold">Ajouter un animal</h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Fermer"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addPet">
            <div class="mb-3">
              <label class="form-label fw-semibold">Nom</label>
              <input v-model="newPet.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Type</label>
              <input v-model="newPet.type" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Âge</label>
              <input v-model.number="newPet.age" type="number" class="form-control" min="0" required />
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Photo (URL)</label>
              <input v-model="newPet.photo" class="form-control" />
            </div>
            <div class="d-flex justify-content-end mt-4">
              <button type="submit" class="btn btn-primary fw-semibold px-4">
                <i class="fa-solid fa-check me-2"></i> Ajouter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  </div>


</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const showModal = ref(false)
const pets = ref([])
const newPet = ref({
  name: '',
  type: '',
  age: null,
  photo: '',
})

async function fetchPets() {
  if (!auth.user) return
  const res = await fetch(`http://localhost:3000/pets/${auth.user.id}`)  // <-- ici
  if (!res.ok) {
    alert('Erreur lors de la récupération des animaux')
    return
  }
  pets.value = await res.json()
}

async function addPet() {
  if (!auth.user) return alert('Connectez-vous !')

  // Prépare les données à envoyer
  const petData = {
    name: newPet.value.name,
    type: newPet.value.type,
    age: newPet.value.age,
    photo: newPet.value.photo,
    ownerId: auth.user.id,
  }

  try {
    const res = await fetch('http://localhost:3000/pets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Erreur lors de l’ajout')
    }

    const addedPet = await res.json()
    pets.value.push(addedPet)
    closeModal()

    // Réinitialise le formulaire
    newPet.value = { name: '', type: '', age: null, photo: '' }
  } catch (error) {
    alert('Erreur : ' + error.message)
  }
}

function closeModal() {
  showModal.value = false
}


onMounted(fetchPets)
const showProfileModal = ref(false)
const selectedPet = ref(null)

function openPetProfile(pet) {
  selectedPet.value = pet
  showProfileModal.value = true
}

function closeProfileModal() {
  showProfileModal.value = false
  selectedPet.value = null
}

async function deletePet(petId) {
  if (!confirm("Voulez-vous vraiment supprimer cet animal ?")) return

  try {
    const res = await fetch(`http://localhost:3000/pets/${petId}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Erreur lors de la suppression')
    }

    // Retire l'animal de la liste locale
    pets.value = pets.value.filter(p => p.id !== petId)

    closeProfileModal()
  } catch (error) {
    alert('Erreur : ' + error.message)
  }
}


</script>
