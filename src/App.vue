<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Contenu principal -->
    <main class="container flex-grow-1 d-flex justify-content-center align-items-center">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </main>


    <!-- Navbar toujours visible en bas -->
    <nav class="navbar navbar-light bg-light border-top">
      <div class="container-fluid justify-content-center">
        <ul class="navbar-nav flex-row justify-content-between w-100">
          <li class="nav-item">
            <router-link
                to="/"
                class="nav-link d-flex flex-column align-items-center"
                active-class="active"
            >
              <i class="fa-solid fa-dog fs-4"></i>
              <span class="small">Explore</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
                to="/Match"
                class="nav-link d-flex flex-column align-items-center"
                active-class="active"
            >
              <i class="fa-solid fa-heart fs-4"></i>
              <span class="small">Matchs</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
                to="/pet"
                class="nav-link d-flex flex-column align-items-center"
                active-class="active"
            >
              <i class="fa-solid fa-paw fs-4"></i>
              <span class="small">Animaux</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link
                to="/profil"
                class="nav-link d-flex flex-column align-items-center"
                active-class="active"
            >
              <i class="fa-solid fa-circle-user fs-4"></i>
              <span class="small">Profil</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>
