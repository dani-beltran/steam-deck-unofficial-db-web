<template>
    <section aria-label="Popular Games" class="popular-games-section">
        <h2 class="section-title">Popular Games</h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
            <LoadingDots message="Loading popular games..." :size="10" />
        </div>

        <!-- Error State -->
        <div v-else-if="popularGames.length === 0" class="error-container">
            <p>Failed to load popular games.</p>
            <button @click="fetchPopularGames" class="retry-button">Retry</button>
        </div>

        <!-- Games Carousel -->
        <Carousel 
            v-else-if="popularGames.length > 0"
            :items="popularGames" 
            :items-per-slide="carouselItemsPerSlide"
            :is-loading-more="isLoadingMore"
            local-storage-key="popularGames_currentIndex"
            prev-aria-label="Previous games"
            next-aria-label="Next games"
            @index-changed="setupIntersectionObserver"
        >
            <template #item="{ item: game }">
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
            </template>

            <template #loading-more>
                <LoadingDots message="Loading more games..." :size="8" />
            </template>
        </Carousel>
    </section>
</template>

<script>
import apiService from '../../services/backend/apiService.js'
import LoadingDots from '../base/LoadingDots.vue'
import Carousel from '../common/Carousel.vue'

export default {
  name: 'PopularGames',
  components: {
    LoadingDots,
    Carousel,
  },
  emits: ['game-selected'],
  data() {
    return {
      carouselItemsPerSlide: 3,
      popularGames: [],
      isLoading: true,
      error: null,
      currentPage: 1,
      pageSize: 17,
      hasMoreGames: true,
      isLoadingMore: false,
      intersectionObserver: null,
    }
  },
  async mounted() {
    this.updateCarouselOnResize()
    await this.fetchPopularGames()
    this.setupIntersectionObserver()
    window.addEventListener('resize', this.updateCarouselOnResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateCarouselOnResize)
    this.disconnectIntersectionObserver()
  },
  methods: {
    async fetchPopularGames() {
      this.isLoading = true
      this.error = null
      try {
        const { items: games, total } = await apiService.fetchMostPlayedGames(this.currentPage, this.pageSize)
        this.popularGames = games || []
        this.hasMoreGames = total >= this.currentPage * this.pageSize
      } catch (err) {
        console.error('Error fetching popular games:', err)
        this.popularGames = []
        this.hasMoreGames = false
      } finally {
        this.isLoading = false
      }
    },
    async loadMoreGames() {
      if (this.isLoadingMore || !this.hasMoreGames) {
        return
      }
      
      this.isLoadingMore = true
      this.currentPage++
      
      try {
        const { items: games, total } = await apiService.fetchMostPlayedGames(this.currentPage, this.pageSize)
        
        if (games && games.length > 0) {
          this.popularGames = [...this.popularGames, ...games]
          this.hasMoreGames = total >= this.currentPage * this.pageSize
        } else {
          this.hasMoreGames = false
        }
      } catch (err) {
        console.error('Error loading more games:', err)
        this.hasMoreGames = false
      } finally {
        this.isLoadingMore = false
      }
    },
    setupIntersectionObserver() {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const lastCard = entries[0]
          if (lastCard.isIntersecting && !this.isLoadingMore && this.hasMoreGames) {
            this.loadMoreGames()
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
      
      const cards = this.$el.querySelectorAll('.carousel-item')
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
    updateCarouselOnResize() {
      const width = window.innerWidth
      if (width < 640) {
        this.carouselItemsPerSlide = 1
      } else if (width < 1024) {
        this.carouselItemsPerSlide = 2
      } else {
        this.carouselItemsPerSlide = 3
      }
    },
    onGameClick(game) {
      this.$emit('game-selected', game)
    },
  },
}
</script>

<style scoped>
.popular-games-section {
    width: 100%;
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
}

.loading-container,
.error-container {
    text-align: center;
    padding: 40px 20px;
}

.error-container p {
    color: var(--text-secondary);
    font-size: 1rem;
    margin-bottom: 16px;
}

.retry-button {
    background: var(--primary-color);
    color: var(--bg-card);
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-button:hover {
    background: var(--primary-color-end);
    transform: translateY(-2px);
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
    height: 180px;
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
    font-size: 1.1rem;
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

/* Responsive Design */
@media (max-width: 1024px) {
    .popular-games-section {
        max-width: 700px;
    }
}

@media (max-width: 576px) {
    .section-title {
        font-size: 1.5rem;
    }

    .popular-games-section {
        max-width: 350px;
        padding: 0;
    }
}
</style>
