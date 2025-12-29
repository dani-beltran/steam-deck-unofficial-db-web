<template>
    <div class="carousel-section">
        <!-- Carousel Container -->
        <div v-if="items.length > 0" class="carousel-container">
            <button class="carousel-button prev" @click="previousSlide" :disabled="currentIndex === 0"
                :aria-label="prevAriaLabel">
                ‹
            </button>

            <div class="carousel-track-wrapper" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
                @touchend="handleTouchEnd" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
                @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
                <div class="carousel-track" :style="trackStyle">
                    <div v-for="(item, index) in displayedItems" :key="index" class="carousel-item">
                        <slot name="item" :item="item" :index="index"></slot>
                    </div>
                    <!-- Loading More Indicator -->
                    <div v-if="isLoadingMore" class="carousel-item loading-more-container">
                        <slot name="loading-more"></slot>
                    </div>
                </div>
            </div>

            <button class="carousel-button next" @click="nextSlide" :disabled="currentIndex >= maxIndex"
                :aria-label="nextAriaLabel">
                ›
            </button>
        </div>

        <!-- Carousel Indicators -->
        <div v-if="items.length > 0" class="carousel-indicators">
            <button v-for="(dot, index) in totalSlides" :key="index" class="indicator-dot"
                :class="{ active: index === currentIndex }" @click="goToSlide(index)"
                :aria-label="`Go to slide ${index + 1}`"></button>
        </div>
    </div>
</template>

<script>
import { useSwipe } from '../../composables/swipe/useSwipe.js'

export default {
  name: 'Carousel',
  props: {
    items: {
      type: Array,
      required: true,
    },
    itemsPerSlide: {
      type: Number,
      default: 3,
    },
    isLoadingMore: {
      type: Boolean,
      default: false,
    },
    localStorageKey: {
      type: String,
      default: 'carousel_currentIndex',
    },
    prevAriaLabel: {
      type: String,
      default: 'Previous items',
    },
    nextAriaLabel: {
      type: String,
      default: 'Next items',
    },
  },
  emits: ['index-changed'],
  data() {
    return {
      currentIndex: 0,
      swipe: null,
      isMobile: false,
    }
  },
  computed: {
    displayedItems() {
      return this.items
    },
    totalSlides() {
      return Math.ceil(this.items.length / this.itemsPerSlide)
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
      this.$emit('index-changed', newIndex)
    },
  },
  async mounted() {
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
        this.currentIndex = 0
        this.isMobile = true
      } else {
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
.carousel-section {
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
    min-width: 0;
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

@media (max-width: 576px) {
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
}

.loading-more-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    padding: 20px;
}
</style>
