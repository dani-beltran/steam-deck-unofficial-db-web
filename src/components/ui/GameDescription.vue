<template>
  <section class="game-description" aria-label="Game information">
    <!-- Game Header with Title and Image -->
    <div class="game-header">
      <GamePreview :game="game" />
      <div class="game-title-section">
        <h1 class="game-title">
          <a :href="steamStoreUrl" target="_blank" rel="noopener noreferrer" class="steam-title-link">
            {{ gameTitle }}
          </a>
        </h1>

        <!-- Game Review Summary -->
        <div v-if="game.steam_app.short_description" class="summary-section">
          <p class="summary-text">{{ game.steam_app.short_description }}</p>
        </div>
      </div>
    </div>

    <!-- Game Rating and Verification -->
    <div class="game-badges">
      <Tooltip v-if="game.steamdeck_rating" :text="getRatingTooltip(game.steamdeck_rating)" position="top-right">
        <div class="rating-badge" :class="`rating-${game.steamdeck_rating}`">
          {{ game.steamdeck_rating.toUpperCase() }}
        </div>
      </Tooltip>
      <Tooltip v-if="game.steamdeck_verified" text="Steam Deck verified game">
        <div class="verified-badge">
          ✓ Verified
        </div>
      </Tooltip>
    </div>
  </section>
</template>

<script>
import Tooltip from '../base/Tooltip.vue'
import GamePreview from './GamePreview.vue'

export default {
  name: 'GameDescription',
  components: {
    Tooltip,
    GamePreview,
  },
  props: {
    game: {
      type: Object,
      default: null,
    }
  },
  data() {
    return {
      gameDetails: null,
    }
  },
  computed: {
    gameTitle() {
      return this.game.steam_app?.name || this.gameDetails.name
    },
    gameId() {
      return this.game?.game_id || ''
    },
    steamStoreUrl() {
      return this.gameId ? `https://store.steampowered.com/app/${this.gameId}/` : '#'
    },
  },
  methods: {
    getRatingTooltip(rating) {
      const tooltips = {
        native: 'Game works natively on linux',
        gold: 'Game works flawlessly after a few changes',
        platinum: 'Game works flawlessly out of the box',
        unsupported: 'Game is not supported',
        borked: 'Game is broken or is unplayable',
      }
      return tooltips[rating] || ''
    },
  },
}
</script>

<style scoped>
.game-description {
  width: 100%;
  margin-bottom: 30px;
}

.game-header {
  display: flex;
  gap: 40px;
  margin-bottom: 25px;
  align-items: flex-start;
}

.steam-title-link {
  color: var(--secondary-text-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.steam-title-link:hover {
  color: #1171d3;
  text-decoration: underline;
}

.game-title-section {
  flex: 1;
  min-width: 0;
}

.game-title {
  color: var(--secondary-text-color);
  margin: 0 0 20px 0;
  font-size: 1.5rem;
  line-height: 1.3;
  font-weight: 600;
}

.game-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.rating-badge,
.verified-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.rating-badge.rating-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4a);
  color: #92400e;
}

.rating-badge.rating-platinum {
  background: linear-gradient(135deg, var(--secondary-border-color), #f3f4f6);
  color: var(--secondary-text-color);
}

.rating-badge.rating-native {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.rating-badge.rating-playable {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: white;
}

.rating-badge.rating-unsupported, .rating-badge.rating-borked {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

.verified-badge {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
}

.summary-section {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border-left: 4px solid #6366f1;
}

.summary-section h3 {
  color: var(--secondary-text-color);
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 15px;
  }

  .game-title {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .game-title {
    font-size: 1.2rem;
  }

  .summary-section {
    padding: 15px;
  }
}
</style>
