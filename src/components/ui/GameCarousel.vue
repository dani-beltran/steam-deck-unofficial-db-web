<template>
    <div class="carousel-wrapper">
        <!-- Games Carousel -->
        <div class="carousel-container">
            <button class="carousel-button prev" @click="previousSlide" :disabled="currentIndex === 0"
                aria-label="Previous games">
                ‹
            </button>

            <div class="carousel-track-wrapper" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
                <div class="carousel-track" :style="trackStyle">
                    <div v-for="(game, index) in games" :key="index" class="carousel-item">
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
        <div v-if="games.length > 0" class="carousel-indicators">
            <button v-for="(dot, index) in totalSlides" :key="index" class="indicator-dot"
                :class="{ active: index === currentIndex }" @click="goToSlide(index)"
                :aria-label="`Go to slide ${index + 1}`"></button>
        </div>
    </div>
</template>

<script>
import { useSwipe } from '../../composables/swipe/useSwipe.js'

export default {
  name: 'GameCarousel',
  props: {
    games: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['game-selected'],
  data() {
    return {
      currentIndex: 0,
      itemsPerSlide: 3,
      swipe: null,
      localStorageKey: 'popularGames_currentIndex',
    }
  },
  computed: {
    totalSlides() {
      return Math.ceil(this.games.length / this.itemsPerSlide)
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
  },
  mounted() {
    this.initCarousel()
    this.restoreCurrentIndex()
    window.addEventListener('resize', this.updateCarouselOnResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateCarouselOnResize)
  },
  methods: {
    initCarousel() {
      this.updateCarouselOnResize()
      this.swipe = useSwipe({
        swipeThreshold: 50,
        velocityThreshold: 0.3,
      })
    },
    updateCarouselOnResize() {
      const width = window.innerWidth
      if (width >= 1024) {
        this.itemsPerSlide = 3
      } else if (width >= 640) {
        this.itemsPerSlide = 2
      } else {
        this.itemsPerSlide = 1
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
.carousel-wrapper {
    width: 100%;
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

.carousel-track {
    display: flex;
    width: 100%;
}

.carousel-item {
    flex: 0 0 33.333%;
    padding: 0 10px;
    box-sizing: border-box;
    min-width: 0;
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
    .carousel-item {
        flex: 0 0 50%;
        min-width: 0;
    }
}
</style>
