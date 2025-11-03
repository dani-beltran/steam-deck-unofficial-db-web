<template>
  <div v-if="deckuGame?.settings?.length" class="game-data-sources">
    <span class="label">Sources:</span>
    <div class="sources-list">
      <a
        v-for="source in sources"
        :key="source"
        :href="getSourceLink(source)"
        target="_blank"
        rel="noopener noreferrer"
        class="source-badge"
        :aria-label="`View data source: ${source}`"
      >
        {{ source }}
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameDataSources',
  props: {
    deckuGame: {
      type: Object,
      required: false
    }
  },
  computed: {
    sources() {
      const sources = this.deckuGame?.settings?.map(setting => setting.source) || [];
      const uniqueSources = [...new Set(sources)];
      return uniqueSources;
    }
  },
  methods: {
    getSourceLink(source) {
        switch(source) {
          case 'steam':
            return `https://store.steampowered.com/app/${this.deckuGame.game_id}`;
          case 'protondb':
            return `https://www.protondb.com/app/${this.deckuGame.game_id}?device=steamDeck`;
          case 'sharedeck':
            return `https://sharedeck.games/apps/${this.deckuGame.game_id}`;
          case 'steamdeckhq':
            return `https://steamdeckhq.com/game-reviews/${this.getFormattedGameName()}`;
          default:
            return '#';
        }
    },
	getFormattedGameName() {
        if (!this.deckuGame || !this.deckuGame.game_name) {
        return '';
        }
        return this.deckuGame.game_name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    }
  }
}
</script>

<style scoped>
.game-data-sources {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--secondary-text-color);
}

.sources-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.source-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
}

.source-badge:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.source-badge:nth-child(1) {
  background: #dbeafe;
  color: #1d4ed8;
}

.source-badge:nth-child(2) {
  background: #dcfce7;
  color: #166534;
}

.source-badge:nth-child(3) {
  background: #fef3c7;
  color: #92400e;
}

.source-badge:nth-child(4) {
  background: #fce7f3;
  color: #be185d;
}

.source-badge:nth-child(5) {
  background: #e0e7ff;
  color: #3730a3;
}
</style>