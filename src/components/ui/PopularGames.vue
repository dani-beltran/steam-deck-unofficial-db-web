<template>
    <section aria-label="Popular Games" class="popular-games-section">
        <h2 class="section-title">Popular Games</h2>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
            <p>Loading popular games...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="popularGames.length === 0" class="error-container">
            <p>Failed to load popular games.</p>
            <button @click="fetchPopularGames" class="retry-button">Retry</button>
        </div>

        <!-- Mobile: Infinite Scroll -->
        <GameInfiniteScroll
            v-else-if="isMobile && popularGames.length > 0"
            :games="popularGames"
            :has-more-games="hasMoreGames"
            :is-loading-more="isLoadingMore"
            @game-selected="onGameClick"
            @load-more="loadMoreGames"
        />

        <!-- Desktop: Carousel -->
        <GameCarousel
            v-else-if="!isMobile && popularGames.length > 0"
            :games="popularGames"
            @game-selected="onGameClick"
        />
    </section>
</template>

<script>
import apiService from '../../services/backend/apiService.js'
import GameCarousel from './GameCarousel.vue'
import GameInfiniteScroll from './GameInfiniteScroll.vue'

export default {
  name: 'PopularGames',
  components: {
    GameCarousel,
    GameInfiniteScroll,
  },
  emits: ['game-selected'],
  data() {
    return {
      isMobile: false,
      popularGames: [],
      isLoading: true,
      error: null,
      currentPage: 1,
      pageSize: 16,
      hasMoreGames: true,
      isLoadingMore: false,
    }
  },
  async mounted() {
    this.checkIfMobile()
    await this.fetchPopularGames()
    window.addEventListener('resize', this.checkIfMobile)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkIfMobile)
  },
  methods: {
    checkIfMobile() {
      this.isMobile = window.innerWidth < 640
    },
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
      if (this.isLoadingMore || !this.hasMoreGames || !this.isMobile) {
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

.loading-container p,
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

/* Responsive Design */
@media (max-width: 1024px) {
    .popular-games-section {
        max-width: 700px;
    }
}

@media (max-width: 640px) {
    .section-title {
        font-size: 1.5rem;
    }

    .popular-games-section {
        max-width: 350px;
        padding: 0;
    }
}
</style>
