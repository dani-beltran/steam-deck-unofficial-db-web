<template>
  <section aria-label="Game Settings" class="settings-section">
    <div class="game-settings">
      <!-- Game Performance Summary -->
      <CollapsibleCard v-if="game && game.game_performance_summary && !loading" title="Performance Analysis"
        card-class="performance-summary-section" aria-label="Game performance summary"
        toggle-aria-label="Toggle performance summary visibility">
        <p>{{ game.game_performance_summary }}</p>
      </CollapsibleCard>

      <!-- Settings Configurations -->
      <section v-if="game && game.settings && game.settings.length > 0 && !loading" class="settings-section"
        aria-label="Game settings configurations">
        <div class="settings-header">
          <h3 id="recommended-settings">Recommended Settings</h3>

          <!-- Hardware Filter Badges -->
          <div class="hardware-filter">
            <span class="filter-label">Filter by Steam Deck:</span>
            <button
              :class="['hardware-filter-badge', 'all', { active: selectedHardware === 'all' }]"
              @click="filterByHardware('all')">
              All
            </button>
            <button v-if="hasLcdSettings"
              :class="['hardware-filter-badge', 'lcd', { active: selectedHardware === 'lcd' }]"
              @click="filterByHardware('lcd')">
              LCD
            </button>
            <button v-if="hasOledSettings"
              :class="['hardware-filter-badge', 'oled', { active: selectedHardware === 'oled' }]"
              @click="filterByHardware('oled')">
              OLED
            </button>
          </div>
        </div>

        <div v-if="currentConfig" class="settings-config">
          <div class="config-header">
            <div class="config-meta">
              <span v-if="currentConfig.steamdeck_hardware" class="hardware-badge">{{
                currentConfig.steamdeck_hardware.toUpperCase() }}</span>
              <span v-if="currentConfig.posted_at" class="date-badge">{{ formatDate(currentConfig.posted_at) }}</span>
            </div>
            <div class="thumbs-rating">
              <ThumbsRating v-if="currentConfig" :user="user" :gameSettings="currentConfig" @vote="submitVote" />
            </div>
          </div>

          <TabComponent :tabs="getSettingsTabsForConfig(currentConfig)" @tab-changed="onTabChanged"
            :default-tab="activeTab">
            <template #default="{ activeTab }">
              <!-- Game Settings Table -->
              <div v-if="activeTab === 'game'">
                <PropertiesTable :data="getFlattenedGameSettings(currentConfig)" :key-prefix="`game-${currentPage}`" />
              </div>

              <!-- Steam Deck Settings Table -->
              <div v-if="activeTab === 'steamdeck'">
                <PropertiesTable :data="getFlattenedSteamDeckSettings(currentConfig)"
                  :key-prefix="`steamdeck-${currentPage}`" />
              </div>

              <!-- Battery Performance Table -->
              <div v-if="activeTab === 'battery'">
                <PropertiesTable :data="getFlattenedBatteryPerformance(currentConfig)"
                  :key-prefix="`battery-${currentPage}`" />
              </div>
            </template>
          </TabComponent>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredSettings.length > 1" class="pagination-section">
          <div class="pagination-label">Not working as you expected? Try another configuration:</div>
          <div class="pagination-controls">
            <button class="pagination-btn" @click="previousConfig" :disabled="currentPage === 1"
              aria-label="Previous configuration">
              ← Previous
            </button>
            <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
            <button class="pagination-btn" @click="nextConfig" :disabled="currentPage === totalPages"
              aria-label="Next configuration">
              Next →
            </button>
          </div>
        </div>
      </section>


      <!-- No Settings Data -->
      <div v-if="searchPerformed && !game?.settings?.length && !loading && !error && !processingWarning"
        class="no-results">
        <p>No optimization settings available for {{ gameTitle }}</p>
      </div>
    </div>
  </section>
</template>

<script>
import { Battery, Gamepad2, Monitor } from 'lucide-vue-next'
import { trackTabClick } from '../../services/analytics'
import { flattenObject } from '../../utils/objectUtils.js'
import CollapsibleCard from '../common/CollapsibleCard.vue'
import PropertiesTable from '../common/PropertiesTable.vue'
import TabComponent from '../common/TabComponent.vue'
import ThumbsRating from './ThumbsRating.vue'

export default {
  name: 'GameSettings',
  components: {
    PropertiesTable,
    TabComponent,
    CollapsibleCard,
    ThumbsRating,
  },
  props: {
    game: {
      type: Object,
      default: null,
    },
    user: {
      type: Object,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    searchPerformed: {
      type: Boolean,
      default: false,
    },
    processingWarning: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedHardware: 'all',
      activeTab: 'game',
      currentPage: 1,
      tabLabels: {
        game: 'Game Settings',
        steamdeck: 'SteamOS Settings',
        battery: 'Battery Performance',
      },
    }
  },
  computed: {
    gameTitle() {
      return this.game.game_name || `Game ID: ${this.game.game_id}`
    },

    filteredSettings() {
      if (!this.game || !this.game.settings) return []

      // First filter by hardware type
      const hardwareFiltered = this.game.settings.filter((config) => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        if (this.selectedHardware === 'all') {
          return true 
        }
        return hardware === this.selectedHardware
      })

      // Group by hardware type and keep only the most relevant
      const hardwareGroups = new Map()

      // Unknown or null hardware goes to 'lcd' group
      hardwareFiltered.forEach((config) => {
        let hardware = config.steamdeck_hardware?.toLowerCase()
        hardware = hardware === 'lcd' || hardware === 'oled' ? hardware : 'lcd'

        if (!hardwareGroups.has(hardware)) {
          hardwareGroups.set(hardware, [])
        }
        hardwareGroups.get(hardware).push(config)
      })

      // For each hardware group, keep only the most complete configuration
      const result = []
      hardwareGroups.forEach((configs) => {
        const sortedConfigs = configs.sort((a, b) => {
          const nSettingsA = a.game_settings ? Object.keys(a.game_settings).length : 0
          const nSettingsB = b.game_settings ? Object.keys(b.game_settings).length : 0
          return nSettingsB - nSettingsA
        })
        result.push(...sortedConfigs)
      })
      return result
    },

    hasLcdSettings() {
      if (!this.game || !this.game.settings) return false

      return this.game.settings.some((config) => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        return hardware === 'lcd' || !hardware
      })
    },

    hasOledSettings() {
      if (!this.game || !this.game.settings) return false

      return this.game.settings.some((config) => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        return hardware === 'oled'
      })
    },

    totalPages() {
      return this.filteredSettings.length
    },

    currentConfig() {
      if (this.filteredSettings.length === 0) return null
      return this.filteredSettings[this.currentPage - 1]
    },
  },
  watch: {
    game: {
      handler(newGame) {
        // Reset filter when new results are loaded - default to 'all'
        this.selectedHardware = 'all'
        // If the game changes, reset to first page
        if (this.game?.game_id !== newGame?.game_id) {
          this.currentPage = 1
        }
      },
      immediate: true,
    },
    selectedHardware() {
      // Reset to first page when filter changes
      this.currentPage = 1
    },
  },
  methods: {
    filterByHardware(hardware) {
      this.selectedHardware = hardware
    },

    nextConfig() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    previousConfig() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    onTabChanged(tabId) {
      this.activeTab = tabId
      trackTabClick(tabId, this.tabLabels[tabId], 'game_settings', {
        game_id: this.game?.game_id,
        game_name: this.game?.game_name,
        hardware_filter: this.selectedHardware,
      })
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      } catch {
        return dateString
      }
    },

    getFlattenedGameSettings(config) {
      if (!config || !config.game_settings) return []
      return flattenObject(config.game_settings)
    },

    getFlattenedSteamDeckSettings(config) {
      if (!config || !config.steamdeck_settings) return []
      return flattenObject(config.steamdeck_settings)
    },

    getFlattenedBatteryPerformance(config) {
      if (!config || !config.battery_performance) return []
      return flattenObject(config.battery_performance)
    },

    getSettingsTabsForConfig(config) {
      const gameSettings = this.getFlattenedGameSettings(config)
      const steamdeckSettings = this.getFlattenedSteamDeckSettings(config)
      const batteryPerformance = this.getFlattenedBatteryPerformance(config)

      return [
        {
          id: 'game',
          label: this.tabLabels.game,
          icon: Gamepad2,
          count: gameSettings.length,
          // For now, we want to show the tabs even if there are no settings
          // hidden: gameSettings.length === 0
        },
        {
          id: 'steamdeck',
          label: this.tabLabels.steamdeck,
          icon: Monitor,
          count: steamdeckSettings.length,
          // hidden: steamdeckSettings.length === 0
        },
        {
          id: 'battery',
          label: this.tabLabels.battery,
          icon: Battery,
          count: batteryPerformance.length,
          // hidden: batteryPerformance.length === 0
        },
      ]
    },

    async submitVote(type) {
      this.$emit('submit-vote', this.currentConfig._id, type)
    },
  },
}
</script>

<style scoped>
.game-settings {
  width: 100%;
}

.performance-summary-section p {
  margin: 0;
}

.settings-section {
  margin-top: 30px;
}

.settings-section>h3 {
  color: var(--secondary-text-color);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 600;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.settings-header h3 {
  margin: 0;
  color: var(--secondary-text-color);
  font-size: 1.3rem;
  font-weight: 600;
}

.hardware-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: 4px;
}

.hardware-filter-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid transparent;
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.hardware-filter-badge:hover {
  background: var(--secondary-border-color);
  color: var(--secondary-text-color);
}

.hardware-filter-badge.active {
  background: var(--primary-color);
  color: white;
  border-color: #2563eb;
}

.hardware-filter-badge.oled.active {
  background: #8b5cf6;
  border-color: #7c3aed;
}

.hardware-filter-badge.lcd.active {
  background: #06b6d4;
  border-color: #0891b2;
}

.hardware-filter-badge.all.active {
  background: #10b981;
  border-color: #059669;
}

.pagination-section {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--secondary-border-color);
}

.pagination-label {
  color: var(--secondary-text-color);
  font-size: 1rem;
  margin-bottom: 15px;
  text-align: center;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.pagination-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #d1d5db;
  background: var(--bg-card);
  color: var(--secondary-text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.pagination-btn:hover:not(:disabled) {
  background: var(---secondary-bg-hover);
  border-color: var(--text-tertiary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--secondary-text-color);
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 150px;
  text-align: center;
}

.settings-config {
  margin-bottom: 30px;
  border: 1px solid var(--secondary-border-color);
  border-radius: 12px;
  overflow: hidden;
  max-width: 100%;
}

.config-header {
  background: var(--bg-secondary);
  padding: 15px 20px;
  border-bottom: 1px solid var(--secondary-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 100%;
  overflow: hidden;
}

.config-header h4 {
  color: var(--secondary-text-color);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  overflow: hidden;
  max-width: 100%;
}

.hardware-badge,
.date-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hardware-badge {
  background: #ddd6fe;
  color: #6d28d9;
}

.date-badge {
  background: #e0e7ff;
  color: #3730a3;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.error-with-top-margin {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .hardware-filter {
    align-self: stretch;
    justify-content: flex-start;
  }

  .pagination-controls {
    flex-wrap: wrap;
    gap: 10px;
  }

  .pagination-btn {
    flex: 1;
    min-width: 100px;
  }

  .pagination-info {
    width: 100%;
    order: -1;
  }

  .pagination-label {
    font-size: 0.9rem;
  }
}
</style>