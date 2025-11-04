<template>
  <div class="app-layout">
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <DarkModeToggle />
    <div class="container">
      <main class="main-content" id="main-content">
        <router-view />
      </main>
    </div>
    <!-- Footer Section -->
    <Footer />
  </div>
</template>

<script>
import Footer from './components/ui/Footer.vue'
import DarkModeToggle from './components/common/DarkModeToggle.vue'
import { useDarkMode } from './composables/useDarkMode'

export default {
  name: 'App',
  components: {
    Footer,
    DarkModeToggle,
  },
  setup() {
    // Initialize dark mode
    useDarkMode()
  },
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

.container {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
}</style>