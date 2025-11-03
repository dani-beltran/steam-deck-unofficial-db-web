<template>
  <section aria-label="Game Settings" class="settings-section">
  <div class="game-settings">
    <!-- Game Performance Summary -->
    <CollapsibleCard
      v-if="results && results.game_performance_summary && !loading"
      title="Performance Analysis"
      card-class="performance-summary-section"
      aria-label="Game performance summary"
      toggle-aria-label="Toggle performance summary visibility"
    >
      <p>{{ results.game_performance_summary }}</p>
    </CollapsibleCard>

    <!-- Settings Configurations -->
    <section v-if="results && results.settings && results.settings.length > 0 && !loading" class="settings-section" aria-label="Game settings configurations">
      <div class="settings-header">
        <h3 id="recommended-settings">Recommended Settings</h3>
        
        <!-- Hardware Filter Badges -->
        <div class="hardware-filter">
          <span class="filter-label">Filter by Steam Deck:</span>
          <button 
            v-if="hasLcdSettings"
            :class="['hardware-filter-badge', 'lcd', { active: selectedHardware === 'lcd' }]"
            @click="filterByHardware('lcd')"
          >
            LCD
          </button>
          <button 
            v-if="hasOledSettings"
            :class="['hardware-filter-badge', 'oled', { active: selectedHardware === 'oled' }]"
            @click="filterByHardware('oled')"
          >
            OLED
          </button>
        </div>
      </div>
      
      <div v-for="(config, index) in filteredSettings" :key="index" class="settings-config">
        <div v-if="filteredSettings.length > 1" class="config-header">
          <h4>Configuration {{ index + 1 }}</h4>
          <div class="config-meta">
            <span v-if="config.steamdeck_hardware" class="hardware-badge">{{ config.steamdeck_hardware.toUpperCase() }}</span>
            <span v-if="config.posted_at" class="date-badge">{{ formatDate(config.posted_at) }}</span>
          </div>
        </div>
        
        <TabComponent 
          :tabs="getSettingsTabsForConfig(config)"
          @tab-changed="onTabChanged"
          :default-tab="activeTab"
        >
          <template #default="{ activeTab }">
            <!-- Game Settings Table -->
            <div v-if="activeTab === 'game'">
              <PropertiesTable :data="getFlattenedGameSettings(config)" :key-prefix="`game-${index}`" />
            </div>
            
            <!-- Steam Deck Settings Table -->
            <div v-if="activeTab === 'steamdeck'">
              <PropertiesTable :data="getFlattenedSteamDeckSettings(config)" :key-prefix="`steamdeck-${index}`" />
            </div>

            <!-- Battery Performance Table -->
            <div v-if="activeTab === 'battery'">
              <PropertiesTable :data="getFlattenedBatteryPerformance(config)" :key-prefix="`battery-${index}`" />
            </div>
          </template>
        </TabComponent>
      </div>
    </section>


    <!-- No Settings Data -->
    <div v-if="searchPerformed && !results?.settings?.length && !loading && !error && !processingWarning" class="no-results">
      <p>No optimization settings available for {{ gameTitle }}</p>
    </div>
  </div>
  </section>
</template>

<script>
import PropertiesTable from '../common/PropertiesTable.vue'
import TabComponent from '../common/TabComponent.vue'
import CollapsibleCard from '../common/CollapsibleCard.vue'
import { flattenObject } from '../../utils/objectUtils.js'
import { trackTabClick } from '../../services/analytics'
import { Gamepad2, Monitor, Battery } from 'lucide-vue-next'

export default {
  name: 'GameSettings',
  components: {
    PropertiesTable,
    TabComponent,
    CollapsibleCard
  },
  props: {
    results: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    searchPerformed: {
      type: Boolean,
      default: false
    },
    processingWarning: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedHardware: 'lcd',
      activeTab: 'game',
      tabLabels: {
        game: 'Game Settings',
        steamdeck: 'SteamOS Settings',
        battery: 'Battery Performance'
      }
    }
  },
  computed: {
    gameTitle() {
      return this.results.game_name || `Game ID: ${this.results.game_id}`
    },
    
    filteredSettings() {
      if (!this.results || !this.results.settings) return []
      
      // First filter by hardware type
      const hardwareFiltered = this.results.settings.filter(config => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        
        if (this.selectedHardware === 'lcd') {
          // Show LCD configurations and those with null/undefined hardware
          return hardware === 'lcd' || !hardware
        }
        
        return hardware === this.selectedHardware
      })
      
      // Group by hardware type and keep only the most recent for each
      const hardwareGroups = new Map()
      
      // Unknown or null hardware goes to 'lcd' group
      hardwareFiltered.forEach(config => {
        let hardware = config.steamdeck_hardware?.toLowerCase()
        hardware = (hardware === 'lcd' || hardware === 'oled') ? hardware : 'lcd'

        if (!hardwareGroups.has(hardware)) {
          hardwareGroups.set(hardware, [])
        }
        hardwareGroups.get(hardware).push(config)
      })
      
      // For each hardware group, keep only the most recent configuration
      const result = []
      hardwareGroups.forEach(configs => {
        // Sort by posted_at date (most recent first) and take the first one
        const sortedConfigs = configs.sort((a, b) => {
          const dateA = a.posted_at ? new Date(a.posted_at) : new Date(0)
          const dateB = b.posted_at ? new Date(b.posted_at) : new Date(0)
          return dateB - dateA // Descending order (most recent first)
        })
        const mostRecentConfig = sortedConfigs[0] 
        result.push(mostRecentConfig)
      })
      
      return result
    },

    hasLcdSettings() {
      if (!this.results || !this.results.settings) return false
      
      return this.results.settings.some(config => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        return hardware === 'lcd' || !hardware
      })
    },

    hasOledSettings() {
      if (!this.results || !this.results.settings) return false

      return this.results.settings.some(config => {
        const hardware = config.steamdeck_hardware?.toLowerCase()
        return hardware === 'oled'
      })
    },
  },
  watch: {
    results: {
      handler() {
        // Reset filter when new results are loaded
        this.selectedHardware = this.hasLcdSettings ? 'lcd' : (this.hasOledSettings ? 'oled' : null)
      },
      immediate: true
    }
  },
  methods: {
    filterByHardware(hardware) {
      this.selectedHardware = hardware
    },
    
    onTabChanged(tabId) {
      this.activeTab = tabId
      trackTabClick(tabId, this.tabLabels[tabId], 'game_settings', {
        game_id: this.results?.game_id,
        game_name: this.results?.game_name,
        hardware_filter: this.selectedHardware
      })
      console.log('Tab changed to:', tabId)
    },

    formatDate(dateString) {
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
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
        }
      ]
    }
  }
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

.settings-section > h3 {
  color: #374151;
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
  color: #374151;
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
  color: #6b7280;
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
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.hardware-filter-badge:hover {
  background: #e5e7eb;
  color: #374151;
}

.hardware-filter-badge.active {
  background: #3b82f6;
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

.settings-config {
  margin-bottom: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.config-header {
  background: #f9fafb;
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-header h4 {
  color: #374151;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.config-meta {
  display: flex;
  gap: 10px;
}

.hardware-badge, .date-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
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
  color: #6b7280;
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
  
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .config-meta {
    align-self: stretch;
    justify-content: flex-start;
  }
}
</style>