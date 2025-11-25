<template>
    <div class="infinite-scroll-wrapper">
        <!-- Games List -->
        <div class="scroll-container">
            <div class="scroll-track">
                <div v-for="(game, index) in games" :key="index" class="scroll-item" :ref="setItemRef(index)">
                    <div class="popular-game-card" @click="onGameClick(game)" role="button" tabindex="0"
                        @keydown.enter="onGameClick(game)" @keydown.space.prevent="onGameClick(game)"
                        :aria-label="`View ${game.name} settings`">
                        <div class="game-image-wrapper">
                            <img v-if="game.header_image" :src="game.header_image" :alt="`${game.name} cover`"
                                class="popular-game-image" @error="$event.target.style.display = 'none'"
                                loading="lazy" />
                            <div v-else class="image-placeholder">
                                <span>{{ game.name.charAt(0) }}</span>
                            </div>
                        </div>
                        <div class="popular-game-info">
                            <h3 class="popular-game-name">{{ game.name }}</h3>
                            <p class="game-steam-id">Steam ID: {{ game.steam_appid }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading More Indicator -->
        <div v-if="isLoadingMore" class="loading-more-container">
            <p>Loading more games...</p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'GameInfiniteScroll',
  props: {
    games: {
      type: Array,
      required: true,
      default: () => []
    },
    hasMoreGames: {
      type: Boolean,
      default: true
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    }
  },
  emits: ['game-selected', 'load-more'],
  data() {
    return {
      intersectionObserver: null,
      itemRefs: []
    }
  },
  watch: {
    games() {
      this.$nextTick(() => {
        this.observeLastCard()
      })
    },
  },
  mounted() {
    this.setupIntersectionObserver()
  },
  beforeUnmount() {
    this.disconnectIntersectionObserver()
  },
  methods: {
    setItemRef(index) {
      return (el) => {
        if (el) {
          this.itemRefs[index] = el
        }
      }
    },
    onGameClick(game) {
      this.$emit('game-selected', game)
    },
    setupIntersectionObserver() {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const lastCard = entries[0]
          if (lastCard.isIntersecting && !this.isLoadingMore && this.hasMoreGames) {
            this.$emit('load-more')
          }
        },
        {
          root: null,
          rootMargin: '100px',
          threshold: 0.1,
        }
      )
      
      this.$nextTick(() => {
        this.observeLastCard()
      })
    },
    observeLastCard() {
      if (!this.intersectionObserver) {
        return
      }
      
      // Disconnect all previous observations
      this.intersectionObserver.disconnect()
      
      const cards = this.$el.querySelectorAll('.scroll-item')
      if (cards.length > 0) {
        const lastCard = cards[cards.length - 1]
        this.intersectionObserver.observe(lastCard)
      }
    },
    disconnectIntersectionObserver() {
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect()
        this.intersectionObserver = null
      }
    },
  },
}
</script>

<style scoped>
.infinite-scroll-wrapper {
    width: 100%;
}

.scroll-container {
    width: 100%;
}

.scroll-track {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.scroll-item {
    width: 100%;
    margin-bottom: 20px;
}

.scroll-item:last-child {
    margin-bottom: 0;
}

.popular-game-card {
    background: var(--bg-card);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    width: 100%;
}

.popular-game-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
}

.game-image-wrapper {
    width: 100%;
    height: 150px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.popular-game-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
    display: block;
    max-width: 100%;
}

.popular-game-card:hover .popular-game-image {
    transform: scale(1.05);
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    font-weight: bold;
    color: var(--bg-card);
}

.popular-game-info {
    padding: 16px;
}

.popular-game-name {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.game-steam-id {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.loading-more-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    padding: 20px;
}

.loading-more-container p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}
</style>
