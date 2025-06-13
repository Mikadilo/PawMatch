<template>
  <div
      class="container d-flex justify-content-center align-items-center"
      style="min-height: calc(100vh - 60px); background: linear-gradient(135deg, #ff9a9e, #fad0c4);"
  >
    <!-- ❤️ Animation de like -->
    <transition name="fade-scale">
      <div v-if="showHeart" class="overlay-icon text-danger">
        <i class="fa-solid fa-heart fa-7x"></i>
      </div>
    </transition>

    <!-- ❌ Animation de dislike -->
    <transition name="fade-scale">
      <div v-if="showCross" class="overlay-icon text-danger">
        <i class="fa-solid fa-xmark fa-7x"></i>
      </div>
    </transition>


    <div
        v-if="currentPet"
        class="card text-center shadow-lg p-3"
        :class="swipeClass"
        :style="cardStyle"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="endDrag"
        @touchstart="startDrag"
        @touchmove="onDrag"
        @touchend="endDrag"
        style="width: 22rem; border-radius: 2rem; position: relative; touch-action: pan-y;"
    >

      <img
          :src="currentPet.photo || defaultImage"
          class="card-img-top rounded-4"
          style="height: 300px; object-fit: cover;"
          alt="Photo de l'animal"
      />
      <div class="card-body">
        <h5 class="card-title">{{ currentPet.name }}</h5>
        <p class="card-text text-muted">{{ currentPet.type }}, {{ currentPet.age }} ans</p>

        <div class="d-flex justify-content-around mt-4">
          <button @click="swipeLeft" class="btn btn-outline-danger rounded-circle px-4 py-2 fs-4">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <button @click="swipeRight" class="btn btn-outline-success rounded-circle px-4 py-2 fs-4">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-white">
      <h3>Vous avez vu tous les animaux !</h3>
      <p class="opacity-75">Revenez plus tard pour en découvrir d'autres 🐾</p>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {useAuthStore} from '../stores/auth.js'

const auth = useAuthStore()
const allPets = ref([])
const currentIndex = ref(0)
const matches = ref([])
const defaultImage = 'https://placekitten.com/400/300'

const currentPet = computed(() => allPets.value[currentIndex.value])

const swipeDirection = ref(null)
const isSwiping = ref(false)
const swipeClass = computed(() => {
  if (!isSwiping.value) return ''
  return swipeDirection.value === 'left' ? 'swipe-left' : 'swipe-right'
})

function nextPet() {
  currentIndex.value++
  resetDrag()
}

// ----------------------
// Drag & swipe detection
// ----------------------
const startX = ref(0)
const currentX = ref(0)
const offsetX = ref(0)
const dragging = ref(false)

const cardStyle = computed(() => {
  if (!dragging.value && !isSwiping.value) return {}

  const rotate = offsetX.value / 20
  return {
    transform: `translateX(${offsetX.value}px) rotate(${rotate}deg)`,
    transition: isSwiping.value ? 'transform 0.3s ease' : 'none',
  }
})

function getEventX(event) {
  return event.type.includes('touch')
      ? event.touches[0].clientX
      : event.clientX
}

function startDrag(event) {
  dragging.value = true
  startX.value = getEventX(event)
  currentX.value = startX.value
}

const showHeart = ref(false)
const showCross = ref(false)

function showOverlay(type) {
  if (type === 'heart') {
    showHeart.value = true
    setTimeout(() => (showHeart.value = false), 600)
  } else if (type === 'cross') {
    showCross.value = true
    setTimeout(() => (showCross.value = false), 600)
  }
}


function onDrag(event) {
  if (!dragging.value) return
  currentX.value = getEventX(event)
  offsetX.value = currentX.value - startX.value
}

function endDrag() {
  if (!dragging.value) return

  dragging.value = false
  const threshold = 100

  if (offsetX.value > threshold) {
    swipeRight()
  } else if (offsetX.value < -threshold) {
    swipeLeft()
  } else {
    offsetX.value = 0
  }
}

function resetDrag() {
  offsetX.value = 0
  swipeDirection.value = null
  isSwiping.value = false
}

function swipe(direction) {
  swipeDirection.value = direction
  isSwiping.value = true

  // Décale la carte visuellement
  offsetX.value = direction === 'left' ? -500 : 500

  setTimeout(() => {
    if (direction === 'right') {
      matches.value.push(currentPet.value)
    }
    nextPet()
  }, 300)
}

async function swipeRight() {
  if (currentPet.value) {
    showOverlay('heart')
    await likePet(currentPet.value.id)
  }
  swipe('right')
}

function swipeLeft() {
  showOverlay('cross')
  swipe('left')
}



async function likePet(petId) {
  try {
    const response = await fetch('http://localhost:3000/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petId, userId: auth.user.id }),
    })
    const result = await response.json()

    if (result.match) {
      alert(`🎉 Match avec le propriétaire de ${petId} !`)
    } else {
      console.log('Pet liké sans match')
    }
  } catch (err) {
    console.error('Erreur lors du like :', err)
  }
}



async function fetchOtherPets() {
  if (!auth.user) return

  const res = await fetch('http://localhost:3000/pets/' + auth.user.id)
  const myPets = await res.json()

  const allRes = await fetch('http://localhost:3000/pets')
  const all = await allRes.json()

  allPets.value = all.filter(p => p.ownerId !== auth.user.id)
}

onMounted(fetchOtherPets)
</script>
<style>
.overlay-icon {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1050;
  opacity: 0.9;
  pointer-events: none;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.4s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.6);
}
</style>
