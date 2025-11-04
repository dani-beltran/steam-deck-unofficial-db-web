<template>
  <div class="game-page">
    <!-- Back to Home and Steam Button Row -->
    <div class="navigation-row">
      <Button @click="goBack" aria-label="Go back to home" size="small">
        ← Back to Search
      </Button>
      <UserProfile :user="user" />
    </div>

    <!-- Loading State -->
    <Spinner v-if="loading" message="Searching for game settings..." />

    <!-- Error State -->
    <ErrorMessage :message="error" @dismiss="clearError" class="error-with-top-margin" />

    <!-- Game Description Section -->
    <GameDescription :game-data="deckuGame" :steam-game-details="steamGameDetails" :loading="loading" />

    <!-- Quick link to settings -->
    <QuickLink v-if="deckuGame" class="quick-links-only-mobile" target-id="settings-section" text="Check the Settings" />

    <GameSettings id="settings-section" :game="deckuGame" :user="user" :loading="loading" :error="error" :search-performed="searchPerformed"
      :processing-warning="processingWarning" @clear-processing-warning="clearProcessingWarning" @submit-vote="handleVoteSubmit" />

    <GameDataSources class="game-data-sources" :deckuGame="deckuGame" />

    <!-- Processing game view -->
    <ProcessingWarning v-if="processingWarning" :game-name="gameTitle" @dismiss="clearProcessingWarning" />
    <RandomArt v-if="processingWarning" />
    <div v-if="processingWarning" style="margin-top: 24px; text-align: center;">
      <RefreshButton @refresh="handleRefresh" :countdown-start="60"/>
    </div>
  </div>
</template>

<script>
import RefreshButton from '../components/common/RefreshButton.vue';
import GameSettings from '../components/ui/GameSettings.vue'
import GameDescription from '../components/ui/GameDescription.vue'
import ProcessingWarning from '../components/ui/ProcessingWarning.vue'
import ErrorMessage from '../components/common/ErrorMessage.vue'
import Spinner from '../components/base/Spinner.vue'
import apiService from '../services/backend/apiService.js'
import GameDataSources from '../components/ui/GameDataSources.vue'
import UserProfile from '../components/ui/UserProfile.vue'
import ThumbsRating from '../components/ui/ThumbsRating.vue'
import QuickLink from "../components/common/QuickLink.vue";
import RandomArt from '../components/common/RandomArt.vue';
import Button from '../components/base/Button.vue';

export default {
  name: 'GamePage',
  components: {
    Button,
    QuickLink,
    GameSettings,
    GameDescription,
    ProcessingWarning,
    ErrorMessage,
    Spinner,
    GameDataSources,
    UserProfile,
    ThumbsRating,
    RefreshButton,
    RandomArt
  },
  props: {
    gameId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      deckuGame: null,
      steamGameDetails: null,
      loading: false,
      error: null,
      searchPerformed: false,
      processingWarning: false,
      user: null
    }
  },
  computed: {
    gameTitle() {
      return this.steamGameDetails?.name || `Game ID ${this.gameId}`
    }
  },
  async mounted() {
    // Add keyboard event listener for backspace key
    document.addEventListener('keydown', this.handleKeydown)
    this.updateDocumentTitle()
    this.loadGame()
    this.user = await apiService.fetchAuthUser()
  },
  unmounted() {
    // Remove keyboard event listener to prevent memory leaks
    document.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    async handleVoteSubmit(gameSettingsId, type) {
      if (type === null ){
        await apiService.removeVote(gameSettingsId);
      } else {
        await apiService.submitVote(gameSettingsId, type);
      }
      // Refresh user and game data to reflect updated votes
      this.user = await apiService.fetchAuthUser();
      this.deckuGame = (await apiService.fetchGame(this.gameId)).game;
    },
    handleRefresh() {
      window.location.reload();
    },
    handleKeydown(event) {
      // Check if backspace key is pressed and not in an input field
      if (event.key === 'Backspace' && !this.isInInputField(event.target)) {
        event.preventDefault()
        this.goBack()
      }
    },

    isInInputField(target) {
      // Check if the target element is an input field where backspace should work normally
      const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT']
      return inputTypes.includes(target.tagName) || target.contentEditable === 'true'
    },

    goBack() {
      // Preserve the search term from the current URL when going back
      const urlParams = new URLSearchParams(window.location.search)
      const searchQuery = urlParams.get('q')

      if (searchQuery) {
        this.$router.push({ name: 'Home', query: { q: searchQuery } })
      } else {
        this.$router.push({ name: 'Home' })
      }
    },

    clearError() {
      this.error = null
    },

    clearProcessingWarning() {
      this.processingWarning = false
    },

    updateDocumentTitle() {
      document.title = `${this.gameTitle} - Steam Deck Settings DB`
    },

    async loadGame() {
      if (!this.gameId) {
        this.error = 'Unknown game ID.'
        return
      }

      this.loading = true
      this.error = null
      this.deckuGame = null
      this.searchPerformed = true
      this.processingWarning = false

      try {
        this.steamGameDetails = await apiService.fetchSteamGame(this.gameId);
        const deckuGame = await apiService.fetchGame(this.gameId)

        if (deckuGame.status === 'queued') {
          this.processingWarning = true
          return
        }

        this.deckuGame = deckuGame.game
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  }
}
</script>

<style scoped>
.game-page {
  width: 100%;
}

.navigation {
  margin-bottom: 20px;
}

.settings-section {
  margin-top: 20px;
}

.error-with-top-margin {
  margin-top: 20px;
}

.steam-login-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Add flex row for navigation buttons */
.navigation-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.game-data-sources {
  margin-bottom: 2rem;
}

.steam-login-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

/* Show on mobile devices */
@media (min-width: 768px) {
  .quick-links-only-mobile {
    display: none;
  }
}
</style>