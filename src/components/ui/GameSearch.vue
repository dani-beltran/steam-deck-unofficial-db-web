<template>
    <div class="search-wrapper">
      <SearchBar
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        placeholder="Enter game name..."
        :loading="loading"
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
</template>

<script>
import {
  trackSearch,
  trackSearchInput,
  trackSuggestionSelect,
} from '../../services/analytics'
import apiService from '../../services/backend/apiService.js'
import { isMobile } from '../../utils/deviceUtils.js'
import Button from '../base/Button.vue'
import SearchBar from '../common/SearchBar.vue'
import SearchSuggestions from '../common/SearchSuggestions.vue'

export default {
  name: 'GameSearch',
  components: {
    Button,
    SearchBar,
    SearchSuggestions,
  },
  emits: ['update:modelValue', 'search'],
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      gameSearchResults: [],
      gameSearchSubmitted: false,
      showRecentGames: false,
      suggestions: [],
      suggestionsLoading: false,
      showSuggestions: false,
      selectedSuggestionIndex: -1,
      debounceTimer: null,
      inputTrackingTimeout: null,
    }
  },
  methods: {
    // When SearchBar is focused, show recent games as suggestions if input is empty.
    async onSearchBarFocus() {
      if (isMobile()) {
        // Don't show suggestions on mobile devices
        return
      }
      if (this.modelValue.trim().length > 0) {
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
      this.gameSearchSubmitted = true
      clearTimeout(this.debounceTimer)
      // Track the search event
      trackSearch(this.modelValue, 'game_search', {
        search_source: submitSource ? submitSource : 'search_bar_button',
      })
      this.showSuggestions = false
      this.$emit('search', this.modelValue)
    },

    async handleSearchBarKeydown(event) {
      if (event.key === 'Enter') {
        if (this.selectedSuggestionIndex === -1) {
          // No suggestion selected, perform search
          this.handleSearch('enter_key')
        }
      }
    },

    onGameNameInput() {
      this.gameSearchSubmitted = false
      this.showRecentGames = false

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
        if (this.modelValue && this.modelValue.trim().length > 0) {
          trackSearchInput(this.modelValue.trim(), this.modelValue.trim().length, 'game_search_input')
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
      if (!this.modelValue.trim() || this.modelValue.trim().length < 2) {
        await this.showRecentGamesAsSuggestions()
        return
      }

      this.suggestionsLoading = true

      try {
        const suggestions = await apiService.searchSteamGamesByName(this.modelValue.trim(), 7)
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
      trackSuggestionSelect(suggestion.name, this.selectedSuggestionIndex, this.modelValue.trim())
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
.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
}
</style>