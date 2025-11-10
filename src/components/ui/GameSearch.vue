<template>
  <div class="search-section">
    <h2 class="search-title">Search by game</h2>
    <div class="search-wrapper">
      <SearchBar
        v-model="gameName"
        placeholder="Enter Steam game name..."
        :loading="gameSearchLoading"
        @search="handleSearch"
        @input="onGameNameInput"
        @blur="hideSuggestions"
        @focus="onSearchBarFocus"
        @keydown="handleSearchBarKeydown"
        aria-label="Search for Steam Deck game settings"
      />
      
      <!-- Suggestions Dropdown -->
      <SearchSuggestions
        :suggestions="suggestions"
        :show="showSuggestions"
        :loading="suggestionsLoading"
        :selected-index="selectedSuggestionIndex"
        :title="showRecentGames ? 'Recent Games Searched' : 'Game Suggestions'"
        @select-suggestion="selectSuggestion"
        @update-selected-index="selectedSuggestionIndex = $event"
        @close-suggestions="closeSuggestions"
      />
    </div>

    <!-- Game Search Results -->
    <div v-if="gameSearchResults.length > 0 && !gameSearchLoading" class="game-results" role="region" aria-label="Search results">
      <h3>Found {{ gameSearchResults.length }} Steam games:</h3>
      <div class="game-grid" role="list" aria-label="List of Steam games with available settings">
        <transition-group name="game-card" tag="div" class="game-grid-inner">
          <GameCard
            v-for="(game, index) in displayedResults" 
            :key="game.id"
            :game="game"
            :is-selected="selectedGameId === game.id"
            :animation-delay="index >= this.INITIAL_RESULTS_COUNT ? (index - this.INITIAL_RESULTS_COUNT) * 0.1 : 0"
            @select="selectGameCard"
            role="listitem"
          />
        </transition-group>
      </div>
      
      <!-- Show More Button -->
      <transition name="show-more">
        <div v-if="hasMoreResults" class="show-more-container">
          <Button 
            @click="handleShowMore" 
            variant="primary" 
            size="medium"
          >
            Show More ({{ gameSearchResults.length - this.INITIAL_RESULTS_COUNT }} more games)
          </Button>
        </div>
      </transition>
    </div>

    <!-- Loading State -->
    <Spinner 
      v-if="gameSearchLoading" 
      message="Searching for games..."
    />

    <!-- Error State -->
    <ErrorMessage 
      :message="gameSearchError"
      @dismiss="clearError"
      class="error-with-top-margin"
    />
  </div>
</template>

<script>
import {
  trackGameSelect,
  trackSearch,
  trackSearchError,
  trackSearchInput,
  trackSearchResults,
  trackShowMoreResults,
  trackSuggestionSelect,
} from '../../services/analytics'
import apiService from '../../services/backend/apiService.js'
import { isMobile } from '../../utils/deviceUtils.js'
import Button from '../base/Button.vue'
import Spinner from '../base/Spinner.vue'
import ErrorMessage from '../common/ErrorMessage.vue'
import SearchBar from '../common/SearchBar.vue'
import SearchSuggestions from '../common/SearchSuggestions.vue'
import GameCard from './GameCard.vue'

export default {
  name: 'GameSearch',
  components: {
    ErrorMessage,
    Spinner,
    GameCard,
    Button,
    SearchBar,
    SearchSuggestions,
  },
  emits: ['game-selected'],
  data() {
    return {
      gameName: '',
      gameSearchResults: [],
      gameSearchLoading: false,
      gameSearchError: null,
      gameSearchSubmitted: false,
      selectedGameId: null,
      showAllResults: false,
      showRecentGames: false,
      INITIAL_RESULTS_COUNT: 4,
      suggestions: [],
      suggestionsLoading: false,
      showSuggestions: false,
      selectedSuggestionIndex: -1,
      debounceTimer: null,
      inputTrackingTimeout: null,
    }
  },
  computed: {
    displayedResults() {
      if (this.showAllResults || this.gameSearchResults.length <= this.INITIAL_RESULTS_COUNT) {
        return this.gameSearchResults
      }
      return this.gameSearchResults.slice(0, this.INITIAL_RESULTS_COUNT)
    },
    hasMoreResults() {
      return this.gameSearchResults.length > this.INITIAL_RESULTS_COUNT && !this.showAllResults
    },
  },
  mounted() {
    // Check if there's a search query in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const searchQuery = urlParams.get('q')

    if (searchQuery) {
      this.gameName = searchQuery
      this.searchGameByName()
    }
  },
  methods: {
    // When SearchBar is focused, show recent games as suggestions if input is empty.
    async onSearchBarFocus() {
      if (this.gameName.trim().length > 0) {
        // If there's input, show suggestions as usual
        this.showSuggestions = this.suggestions.length > 0
        return
      }
      await this.showRecentGamesAsSuggestions()
    },

    async showRecentGamesAsSuggestions() {
      try {
        this.suggestions = await this.getRecentGames()
        this.showSuggestions = this.suggestions.length > 0
        this.selectedSuggestionIndex = -1
        this.showRecentGames = true
      } catch (e) {
        console.warn('Error fetching recent games by IDs:', e)
        this.suggestions = []
        this.showSuggestions = false
        this.showRecentGames = false
      }
    },

    async getRecentGames() {
      const recentIds = this.getRecentSearchedGameIds()

      if (recentIds.length === 0) {
        return []
      }

      try {
        const result = await apiService.fetchSteamGamesByIds(recentIds)
        return result.items || []
      } catch (e) {
        console.warn('Error fetching recent games by IDs:', e)
        return []
      }
    },

    getRecentSearchedGameIds() {
      const storageKey = 'recentSearchedGameIds'
      let recentIds = []
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          recentIds = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Error parsing recent searched game IDs from localStorage:', e)
      }
      return Array.isArray(recentIds) ? recentIds : []
    },

    async handleSearch(submitSource) {
      clearTimeout(this.debounceTimer)
      this.closeSuggestions()

      // Update URL with search param
      this.updateSearchParam(this.gameName)

      this.searchGameByName()
      // Track the search event
      trackSearch(this.gameName, 'game_search', {
        search_source: submitSource ? submitSource : 'search_bar_button',
      })
    },
    async handleSearchBarKeydown(event) {
      if (event.key === 'Enter') {
        if (this.selectedSuggestionIndex === -1) {
          // No suggestion selected, perform search
          this.handleSearch('enter_key')
        }
      }
    },
    async searchGameByName() {
      if (!this.gameName.trim()) {
        this.gameSearchError = 'Please enter a game name'
        return
      }

      this.gameSearchSubmitted = true
      this.gameSearchLoading = true
      this.gameSearchError = null
      this.gameSearchResults = []
      this.selectedGameId = null
      this.showAllResults = false

      // Ensure suggestions are completely hidden
      this.suggestions = []
      this.showSuggestions = false
      this.selectedSuggestionIndex = -1

      try {
        const results = await apiService.searchSteamGamesByName(this.gameName.trim())
        const games = results.items || []
        this.gameSearchResults = games

        // Track search results
        trackSearchResults(this.gameName.trim(), results.total, games.length > 0, 'game_search')

        if (games.length === 0) {
          this.gameSearchError = 'No games found with that name. Try a different search term.'
        }
      } catch (err) {
        console.error('Error searching for games:', err)
        this.gameSearchError = `Failed to search for games: ${err.message}`

        // Track search error
        trackSearchError(this.gameName.trim(), err.message, 'game_search')
      } finally {
        this.gameSearchLoading = false
      }
    },

    onGameNameInput() {
      this.gameSearchSubmitted = false
      this.showRecentGames = false

      // Clear previous search results when user starts typing
      if (this.gameSearchResults.length > 0) {
        this.gameSearchResults = []
        this.selectedGameId = null
        this.showAllResults = false
      }
      if (this.gameSearchError) {
        this.gameSearchError = null
      }

      // Track search input with debouncing to avoid too many events
      this.debounceTrackInput()

      // Trigger suggestions with debouncing (only on non-mobile devices)
      if (!isMobile()) {
        this.debouncedFetchSuggestions()
      }
    },

    debounceTrackInput() {
      // Clear existing timeout
      if (this.inputTrackingTimeout) {
        clearTimeout(this.inputTrackingTimeout)
      }

      // Set new timeout to track input after 1 second of inactivity
      this.inputTrackingTimeout = setTimeout(() => {
        if (this.gameName && this.gameName.trim().length > 0) {
          trackSearchInput(this.gameName.trim(), this.gameName.trim().length, 'game_search_input')
        }
      }, 1000)
    },

    debouncedFetchSuggestions() {
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      // Set new timer for 300ms delay
      this.debounceTimer = setTimeout(() => {
        this.fetchSuggestions()
      }, 300)
    },

    async fetchSuggestions() {
      if (!this.gameName.trim() || this.gameName.trim().length < 2) {
        await this.showRecentGamesAsSuggestions()
        return
      }

      this.suggestionsLoading = true

      try {
        const suggestions = await apiService.searchSteamGamesByName(this.gameName.trim(), 7)
        // Only show suggestions if the search hasn't been submitted
        this.suggestions = this.gameSearchSubmitted ? [] : suggestions.items || []
        this.showSuggestions = this.suggestions.length > 0
        this.selectedSuggestionIndex = -1
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        this.suggestions = []
        this.showSuggestions = false
      } finally {
        this.suggestionsLoading = false
      }
    },

    async selectSuggestion(suggestion) {
      trackSuggestionSelect(suggestion.name, this.selectedSuggestionIndex, this.gameName.trim())
      this.closeSuggestions()
      this.saveRecentSearchedGameId(suggestion.id)
      // Route directly to the game page using the suggestion ID
      this.$router.push(`/game/${suggestion.id}`)
    },

    closeSuggestions() {
      this.suggestions = []
      this.showSuggestions = false
      this.selectedSuggestionIndex = -1
      this.showRecentGames = false
    },

    hideSuggestions() {
      // Add a small delay to allow for suggestion clicks
      setTimeout(() => {
        this.showSuggestions = false
        this.selectedSuggestionIndex = -1
      }, 150)
    },

    selectGameCard(game) {
      trackGameSelect(game, 'search_result')

      this.selectedGameId = game.id
      this.saveRecentSearchedGameId(game.id)

      const searchTerm = this.gameName.trim()
      this.$emit('game-selected', game, searchTerm)
    },

    saveRecentSearchedGameId(gameId) {
      const storageKey = 'recentSearchedGameIds'
      let recentIds = []
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          recentIds = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Error parsing recent searched game IDs from localStorage:', e)
      }
      // Remove if already present
      recentIds = recentIds.filter((id) => id !== gameId)
      // Add to front
      recentIds.unshift(gameId)
      // Limit to 10
      if (recentIds.length > 10) {
        recentIds = recentIds.slice(0, 10)
      }
      try {
        localStorage.setItem(storageKey, JSON.stringify(recentIds))
      } catch (e) {
        console.warn('Error saving recent searched game IDs to localStorage:', e)
      }
    },

    clearError() {
      this.gameSearchError = null
    },

    handleShowMore() {
      trackShowMoreResults(
        this.gameName.trim(),
        this.gameSearchResults.length,
        this.INITIAL_RESULTS_COUNT
      )
      this.showAllResults = true
    },

    updateSearchParam(query) {
      const url = new URL(window.location)
      if (query?.trim()) {
        url.searchParams.set('q', query.trim())
      } else {
        url.searchParams.delete('q')
      }
      window.history.pushState({}, '', url)
    },
  },
  beforeUnmount() {
    // Clean up debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    // Clean up input tracking timeout
    if (this.inputTrackingTimeout) {
      clearTimeout(this.inputTrackingTimeout)
    }
  },
}
</script>

<style scoped>
.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.search-title {
  color: var(--secondary-text-color);
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}

/* Game Search Results Styles */
.game-results {
  margin-top: 30px;
  width: 100%;
  max-width: 800px;
}

.game-results h3 {
  color: var(--secondary-text-color);
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.game-grid-inner {
  display: contents;
}

/* Animation styles for game cards */
.game-card-enter-active {
  transition: all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  transition-delay: var(--animation-delay, 0s);
}

.game-card-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.9);
}

.game-card-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.game-card-leave-active {
  transition: all 0.3s ease;
}

.game-card-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.show-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* Show More button transition animations */
.show-more-enter-active {
  transition: all 0.4s ease;
}

.show-more-leave-active {
  transition: all 0.3s ease;
}

.show-more-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.show-more-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

@media (max-width: 768px) {
  .search-title {
    font-size: 1.3rem;
  }

  .game-grid {
    grid-template-columns: 1fr;
  }
}

.error-with-top-margin {
  margin-top: 20px;
}
</style>