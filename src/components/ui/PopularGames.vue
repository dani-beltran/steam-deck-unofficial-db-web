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

        <!-- Games Carousel -->
        <div v-else-if="popularGames.length > 0" class="carousel-container">
            <button class="carousel-button prev" @click="previousSlide" :disabled="currentIndex === 0"
                aria-label="Previous games">
                ‹
            </button>

            <div class="carousel-track-wrapper" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
                <div class="carousel-track" :style="trackStyle">
                    <div v-for="(game, index) in displayedGames" :key="index" class="carousel-item">
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

            <button class="carousel-button next" @click="nextSlide" :disabled="currentIndex >= maxIndex"
                aria-label="Next games">
                ›
            </button>
        </div>

        <!-- Carousel Indicators -->
        <div v-if="popularGames.length > 0" class="carousel-indicators">
            <button v-for="(dot, index) in totalSlides" :key="index" class="indicator-dot"
                :class="{ active: index === currentIndex }" @click="goToSlide(index)"
                :aria-label="`Go to slide ${index + 1}`"></button>
        </div>

        <!-- Loading More Indicator (Mobile Only) -->
        <div v-if="isMobile && isLoadingMore" class="loading-more-container">
            <p>Loading more games...</p>
        </div>
    </section>
</template>

<script>
import { useSwipe } from '../../composables/swipe/useSwipe.js'
import apiService from '../../services/backend/apiService.js'

export default {
  name: 'PopularGames',
  emits: ['game-selected'],
  data() {
    return {
      currentIndex: 0,
      itemsPerSlide: 3,
      swipe: null,
      isMobile: false,
      popularGames: [],
      isLoading: true,
      error: null,
      localStorageKey: 'popularGames_currentIndex',
      currentPage: 1,
      pageSize: 16,
      hasMoreGames: true,
      isLoadingMore: false,
      intersectionObserver: null,
    }
  },
  computed: {
    displayedGames() {
      return this.popularGames
    },
    totalSlides() {
      return Math.ceil(this.popularGames.length / this.itemsPerSlide)
    },
    maxIndex() {
      return this.totalSlides - 1
    },
    trackStyle() {
      const translateX = -(this.currentIndex * 100)
      const swipeOffset = this.swipe?.swipeState?.isDragging
        ? (this.swipe?.swipeState.translateX / window.innerWidth) * 100
        : 0

      return {
        transform: `translateX(calc(${translateX}% + ${swipeOffset}px))`,
        transition: this.swipe?.swipeState?.isDragging ? 'none' : 'transform 0.3s ease-in-out',
      }
    },
  },
  watch: {
    currentIndex(newIndex) {
      this.saveCurrentIndex(newIndex)
    },
    popularGames() {
      this.$nextTick(() => {
        this.observeLastCard()
      })
    },
  },
  async mounted() {
    this.initCarousel()
    await this.fetchPopularGames()
    this.restoreCurrentIndex()
    window.addEventListener('resize', this.updateCarouselOnResize)
    this.setupIntersectionObserver()
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
    initCarousel() {
      this.updateCarouselOnResize()
      if (!this.isMobile) {
        this.swipe = useSwipe({
          swipeThreshold: 50,
          velocityThreshold: 0.3,
        })
      }
    },
    updateCarouselOnResize() {
      const width = window.innerWidth
      const wasMobile = this.isMobile
      if (width < 640) {
        this.itemsPerSlide = 1
        this.isMobile = true
        this.currentIndex = 0
      } else if (width < 1024) {
        this.itemsPerSlide = 2
        this.isMobile = false
      } else {
        this.itemsPerSlide = 3
        this.isMobile = false
      }

      // Initialize or destroy swipe based on mobile state change
      if (wasMobile !== this.isMobile) {
        if (this.isMobile && this.swipe) {
          this.swipe.resetSwipeState()
          this.swipe = null
        } else if (!this.isMobile && !this.swipe) {
          this.swipe = useSwipe({
            swipeThreshold: 50,
            velocityThreshold: 0.3,
          })
        }
      }

      // Setup or disconnect intersection observer based on mobile state
      if (wasMobile !== this.isMobile) {
        if (this.isMobile) {
          this.setupIntersectionObserver()
        } else {
          this.disconnectIntersectionObserver()
        }
      }
    },
    nextSlide() {
      if (this.currentIndex < this.maxIndex) {
        this.currentIndex++
      }
    },
    previousSlide() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    goToSlide(index) {
      this.currentIndex = index
    },
    onGameClick(game) {
      this.$emit('game-selected', game)
    },
    handleTouchStart(event) {
      this.swipe?.handleTouchStart(event)
    },
    handleTouchMove(event) {
      this.swipe?.handleTouchMove(event, this.currentIndex, this.totalSlides)
      // Prevent scrolling when swiping horizontally
      if (this.swipe?.swipeState.isDragging) {
        event.preventDefault()
      }
    },
    handleTouchEnd() {
      const result = this.swipe?.handleTouchEnd(this.currentIndex, this.totalSlides)
      if (result && result.type === 'change') {
        this.currentIndex = result.newIndex
      }
    },
    handleMouseDown(event) {
      this.swipe?.handleMouseDown(event)
    },
    handleMouseMove(event) {
      this.swipe?.handleMouseMove(event, this.currentIndex, this.totalSlides)
    },
    handleMouseUp() {
      const result = this.swipe?.handleMouseEnd(this.currentIndex, this.totalSlides)
      if (result && result.type === 'change') {
        this.currentIndex = result.newIndex
      }
    },
    handleMouseLeave() {
      if (this.swipe?.swipeState.isPointerDown) {
        this.swipe?.resetSwipeState()
      }
    },
    saveCurrentIndex(index) {
      try {
        localStorage.setItem(this.localStorageKey, index.toString())
      } catch (err) {
        console.warn('Failed to save current index to localStorage:', err)
      }
    },
    restoreCurrentIndex() {
      try {
        const savedIndex = localStorage.getItem(this.localStorageKey)
        if (savedIndex !== null) {
          const index = parseInt(savedIndex, 10)
          if (!Number.isNaN(index) && index >= 0 && index <= this.maxIndex) {
            this.currentIndex = index
          }
        }
      } catch (err) {
        console.warn('Failed to restore current index from localStorage:', err)
      }
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

.carousel-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
}

.carousel-button {
    background: var(--bg-card);
    border: 2px solid var(--secondary-border-color);
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: var(--secondary-text-color);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    z-index: 10;
}

.carousel-button:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--bg-card);
    border-color: var(--primary-color);
    transform: scale(1.1);
}

.carousel-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.carousel-track-wrapper {
    flex: 1;
    overflow: hidden;
    cursor: grab;
    user-select: none;
}

.carousel-track-wrapper:active {
    cursor: grabbing;
}

@media (max-width: 640px) {
    .carousel-track-wrapper {
        cursor: default;
    }
}

.carousel-track {
    display: flex;
    width: 100%;
}

.carousel-item {
    flex: 0 0 33.333%;
    padding: 0 10px;
    box-sizing: border-box;
    min-width: 0; /* Allow flex item to shrink below content size */
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
    display: block; /* Remove inline spacing */
    max-width: 100%; /* Prevent image overflow */
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

.carousel-indicators {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;
}

.indicator-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #d1d5db;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
}

.indicator-dot:hover {
    background: var(--text-tertiary);
}

.indicator-dot.active {
    background: var(--primary-color);
    width: 30px;
    border-radius: 5px;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .popular-games-section {
        max-width: 700px;
    }

    .carousel-item {
        flex: 0 0 50%;
        min-width: 0; /* Allow flex item to shrink below content size */
    }
}

@media (max-width: 576px) {
    .section-title {
        font-size: 1.5rem;
    }

    .carousel-track {
        flex-direction: column;
        transform: none !important;
        transition: none !important;
    }

    .carousel-item {
        flex: 0 0 auto;
        width: 100%;
        margin-bottom: 20px;
    }

    .carousel-item:last-child {
        margin-bottom: 0;
    }

    .carousel-button {
        display: none;
    }

    .carousel-container {
        gap: 0;
    }

    .carousel-indicators {
        display: none;
    }

    .game-image-wrapper {
        height: 150px;
    }

    .popular-game-name {
        font-size: 1rem;
    }

    .popular-games-section {
        max-width: 350px;
        padding: 0;
    }
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
